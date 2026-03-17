import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { z } from "zod";
import multer from "multer";

import { taskQueue } from "../api/TaskQueue.js";

import { supabaseAnon, supabaseService } from "../api/supabaseClient.js";
import {
  insertNewJob,
  updateJobStatus,
  WorkflowJobStatus,
} from "../api/supabaseService.js";
import { sendNewRfDiffusion3Job } from "../api/neurosnapAPI.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

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
  if (error2) {
    return res.status(401).json({ message: "Profile fetch failed" });
  }
  return res.json({
    user: {
      id: data.user.id,
      email: data.user.email,
      name: userProfile.user_name,
    },
  });
});

// -------- Neurosnap API Proxy Endpoint --------

// Multer: store uploaded files directly to memory as Buffer object
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
      contig,
      numberDesigns = "1",
      timesteps = "10",
      stepScale = "1.5",
    } = req.body;
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

      // inserting into DB and then pushing to queue
      const jobData = await insertNewJob(
        "none.com", // UPDATE W/ BLOB
        null,
        WorkflowJobStatus.INQUEUE,
        null,
      );
      // TO:DO ADD THE INITIAL PUSH TO THE JOB
      taskQueue
        .push({
          workflowJobId: jobData.job_id,
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
// -------- Neurosnap API Proxy Endpoint --------

const PORT = Number(process.env.PORT);

app.listen(PORT, () => {
  console.log("app listening on", `${PORT}`);
});
