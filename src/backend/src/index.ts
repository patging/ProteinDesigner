import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { z } from "zod";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

import { taskQueue } from "./api/TaskQueue.js";

import { supabaseAnon, supabaseService } from "./api/supabaseClient.js";
import {
  insertJobParameters,
  insertNewJob,
  WorkflowJobStatus,
} from "./api/supabaseService.js";
import { uploadFile } from "./api/azureBlobAPI.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "https://protein-designer-eight.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
  }),
);

app.get("/health", (req, res) => res.json({ ok: true }));

console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_ANON_KEY exists:", !!process.env.SUPABASE_ANON_KEY);
console.log(
  "SUPABASE_SERVICE_ROLE_KEY exists:",
  !!process.env.SUPABASE_SERVICE_ROLE_KEY,
);

app.post("/signup", async (req, res) => {
  const Body = z.object({
    name: z.string().min(1),
    email: z.email(),
    password: z.string().min(8),
  });

  const parsed = Body.safeParse(req.body);
  if (!parsed.success) {
    console.log("signup req body:", req.body);
    return res.status(400).json({
      message: "Invalid input",
    });
  }
  const { name, email, password } = parsed.data;

  const { data, error } = await supabaseAnon.auth.signUp({
    email,
    password,
  });

  if (error) {
    return res.status(400).json({ message: error.message });
  }
  if (!data.user) {
    return res.status(400).json({ message: "signup failed" });
  }

  const { error: e } = await supabaseService.from("user_profile").insert({
    user_id: data.user.id,
    user_name: name,
    user_email: email,
  });

  if (e) {
    console.error(e);
    return res.status(500).json({
      message: "Profile creation failed",
    });
  }

  return res.json({
    user: {
      id: data.user.id,
      email: data.user.email,
      name: name,
    },
    session: data.session,
  });
});

app.post("/login", async (req, res) => {
  const Body = z.object({
    email: z.email(),
    password: z.string().min(1),
  });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) {
    console.log("error parsing body", req.body);
    return res.status(400).json({ message: "Invalid input" });
  }

  const { email, password } = parsed.data;

  const { data, error } = await supabaseAnon.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  if (!data.user) {
    return res.status(400).json({ message: "no user" });
  }

  const { data: userProfile, error: error2 } = await supabaseService
    .from("user_profile")
    .select("user_name")
    .eq("user_id", data.user.id)
    .single();
  console.log(userProfile);
  if (error2) {
    return res.status(401).json({ message: "Profile fetch failed" });
  }
  return res.json({
    user: {
      id: data.user.id,
      email: data.user.email,
      name: userProfile.user_name,
    },
    session: data.session,
  });
});

// app.post("/logout", async (req, res) => {
//     const {error} = await supabaseAnon.auth.signOut();
//     if(error){
//         console.log(error.message || "Error with signing out")
//         return res.status(500).json({message: "Error with signing out"})
//     }

//     return res.status(200).json(
//         {
//             message: "Successfully signed out of ProteinDesigner"
//         }
//     )
// })

app.get("/me/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) {
    console.log("no id in the request, check communication");
    return res.status(400).json({ message: "No id given" });
  }

  const { data: profile, error: profileError } = await supabaseService
    .from("user_profile")
    .select("user_name, user_email")
    .eq("user_id", id)
    .single();

  if (profileError || !profile) {
    console.log(
      profileError?.message ||
        "There was an error when fetching profile from user table in supabase",
    );
    return res
      .status(400)
      .json({ message: "problem fetching profile from supabase" });
  }
  return res.json({
    user: {
      name: profile.user_name,
      email: profile.user_email,
      id: id,
    },
  });
});

/**
 * GET /api/jobs
 *
 * List all jobs for the authenticated user, including job status and result URLs if available. Results are ordered by creation time, with most recent first.
 */
app.get("/api/jobs", async (req, res) => {
  // Validate userId query param
  const parsedUserId = z.uuid().safeParse(req.query.userId);
  if (!parsedUserId.success) {
    return res.status(400).json({ message: "userId query param is required" });
  }

  try {
    const userId = parsedUserId.data;

    // Query jobs table for all jobs belonging to the user, along with status and creation time. Order by creation time descending
    const { data: jobsData, error: jobsError } = await supabaseService
      .from("jobs")
      .select("job_id, job_status_id, job_start_time, job_input_file_url")
      .eq("user_id", userId)
      .order("job_start_time", { ascending: false, nullsFirst: false });

    if (jobsError) {
      throw jobsError;
    }

    // Query job_status table to get mapping of status_id to status_message for all possible statuses
    const { data: statusData, error: statusError } = await supabaseService
      .from("job_status")
      .select("job_status_id, job_status_message");

    if (statusError) {
      throw statusError;
    }

    const statusById = new Map<number, string>();
    for (const status of statusData ?? []) {
      statusById.set(status.job_status_id, status.job_status_message);
    }

    const jobIds = (jobsData ?? []).map((job) => job.job_id);
    let resultByJobId = new Map<string, string>();

    // If there are any jobs, query job_results table to get mapping of job_id to job_result_file_url for all jobs that have results
    if (jobIds.length > 0) {
      const { data: resultsData, error: resultsError } = await supabaseService
        .from("job_results")
        .select("job_id, job_result_file_url")
        .in("job_id", jobIds);

      if (resultsError) {
        throw resultsError;
      }

      resultByJobId = new Map<string, string>(
        (resultsData ?? []).map((result) => [
          result.job_id,
          result.job_result_file_url,
        ]),
      );
    }

    // Return results after querying all necessary tables, mapping job status and results to each job
    const response = (jobsData ?? []).map((job) => ({
      jobId: job.job_id,
      status: statusById.get(job.job_status_id) ?? "missing",
      createdAt: job.job_start_time,
      inputFileUrl: job.job_input_file_url,
      outputFileUrl: resultByJobId.get(job.job_id) ?? null,
    }));

    return res.json({ jobs: response });
  } catch (err: any) {
    console.error("Error fetching jobs:", err);
    return res.status(500).json({ message: err.message || "Unexpected error" });
  }
});

/**
 * GET /api/jobs/:jobId
 *
 * Get details for a specific job, including status and result URLs if available.
 */
app.get("/api/jobs/:jobId", async (req, res) => {
  const parsedJobId = z.uuid().safeParse(req.params.jobId);
  const parsedUserId = z.uuid().safeParse(req.query.userId);

  if (!parsedJobId.success) {
    return res.status(400).json({ message: "Invalid jobId" });
  }
  if (!parsedUserId.success) {
    return res.status(400).json({ message: "userId query param is required" });
  }

  const jobId = parsedJobId.data;
  const userId = parsedUserId.data;

  try {
    const { data: job, error: jobError } = await supabaseService
      .from("jobs")
      .select(
        "job_id, user_id, job_status_id, job_start_time, job_input_file_url",
      )
      .eq("job_id", jobId)
      .eq("user_id", userId)
      .single();

    if (jobError || !job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const { data: statusData, error: statusError } = await supabaseService
      .from("job_status")
      .select("job_status_message")
      .eq("job_status_id", job.job_status_id)
      .single();

    if (statusError) {
      throw statusError;
    }

    const { data: resultRows, error: resultError } = await supabaseService
      .from("job_results")
      .select("job_result_id, job_result_file_url")
      .eq("job_id", jobId)
      .order("job_result_id", { ascending: true })
      .limit(1);

    if (resultError) {
      throw resultError;
    }

    const outputFileUrl = resultRows?.[0]?.job_result_file_url ?? null;

    return res.json({
      jobId: job.job_id,
      status: statusData?.job_status_message ?? "missing",
      createdAt: job.job_start_time,
      inputFileUrl: job.job_input_file_url,
      outputFileUrl,
      designMethod: "RFDiffusion",
      targetProtein: null,
    });
  } catch (err: any) {
    console.error("Error fetching single job:", err);
    return res.status(500).json({ message: err.message || "Unexpected error" });
  }
});

/**
 * GET /api/blob-proxy
 *
 * Proxies a request to an Azure Blob Storage URL, returning the blob file contents.
 */
app.get("/api/blob-proxy", async (req, res) => {
  const rawUrl = req.query.url;
  if (typeof rawUrl !== "string" || rawUrl.length === 0) {
    return res.status(400).json({ message: "url query param is required" });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return res.status(400).json({ message: "Invalid url" });
  }

  // Avoid SSRF by only allowing Azure Blob Storage URLs
  if (
    parsedUrl.protocol !== "https:" ||
    !parsedUrl.hostname.endsWith(".blob.core.windows.net")
  ) {
    return res
      .status(400)
      .json({ message: "Only Azure blob URLs are allowed" });
  }

  try {
    const upstream = await fetch(parsedUrl.toString(), { method: "GET" });
    if (!upstream.ok) {
      return res.status(upstream.status).json({
        message: `Unable to fetch blob file (${upstream.status})`,
      });
    }

    const arrayBuffer = await upstream.arrayBuffer();
    const contentType =
      upstream.headers.get("content-type") || "application/octet-stream";
    const fileName = parsedUrl.pathname.split("/").pop() || "structure.pdb";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", String(arrayBuffer.byteLength));
    res.setHeader("Cache-Control", "private, max-age=120");
    res.setHeader("Content-Disposition", `inline; filename=\"${fileName}\"`);

    return res.send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    console.error("Blob proxy error:", err);
    return res.status(500).json({ message: err.message || "Unexpected error" });
  }
});

const upload = multer({ storage: multer.memoryStorage() });
/**
 * POST /api/submit-rfdiffusion3
 *
 * Receives a .pdb file + RFdiffusion3 parameters from the frontend,
 * then proxies the request to Neurosnap's API (keeping the API key server-side).
 */
app.post(
  "/api/submit-rfdiffusion3",
  upload.single("pdbFile"),
  async (req, res) => {
    if (!req.file)
      return res.status(400).json({ message: "No PDB file provided" });

    const {
      userId,
      contig,
      numberDesigns = "1",
      timesteps = "10",
      stepScale = "1.5",
    } = req.body;
    const parsedUserId = z.uuid().safeParse(userId);
    if (!parsedUserId.success) {
      return res.status(400).json({ message: "userId is required" });
    }
    if (!contig) return res.status(400).json({ message: "Contig is required" });

    const apiKey = process.env.NEUROSNAP_API_KEY;
    if (!apiKey)
      return res
        .status(500)
        .json({ message: "NEUROSNAP_API_KEY is not configured on the server" });

    try {
      const formData = new FormData();
      formData.append(
        "Input Structure",
        new Blob([new Uint8Array(req.file.buffer)]),
        req.file.originalname,
      );
      const originalFileName = req.file.originalname;
      const file = new Blob([new Uint8Array(req.file.buffer)]);

      // uploading the input file to Azure
      const inputFileLocalUrl = URL.createObjectURL(file);
      const inputFileAzureUrl = await uploadFile(
        inputFileLocalUrl,
        `${uuidv4()}.pdb`,
      );

      // inserting into DB and then pushing to queue
      const jobData = await insertNewJob(
        parsedUserId.data,
        inputFileAzureUrl,
        contig,
        WorkflowJobStatus.INQUEUE,
        null,
      );
      const job_id = jobData.job_id;
      await insertJobParameters(
        job_id,
        contig,
        numberDesigns,
        timesteps,
        stepScale,
      );

      taskQueue
        .push({
          workflowJobId: job_id,
          file: file,
          fileOriginalName: originalFileName,
          contig: contig,
          numDesigns: numberDesigns,
          timeSteps: timesteps,
          stepScale: stepScale,
        })
        .catch((e) => console.log(e));

      // returning the ID
      return res.json({ jobId: jobData.job_id });
    } catch (err: any) {
      console.error("Neurosnap proxy error:", err);
      return res
        .status(500)
        .json({ message: err.message || "Unexpected error" });
    }
  },
);

const PORT = Number(process.env.PORT);

app.listen(PORT, () => {
  console.log("app listening on", `${PORT}`);
});
