import fs from "node:fs";
import "dotenv/config";

const BASE_URL = "https://neurosnap.ai";
const API_URL = `${BASE_URL}/api/job/submit/RFdiffusion3`;

/**
 * submitMotifScaffoldingJob
 *
 * Uses Neurosnap's API to submit a motif scaffolding job to RFdiffusion3
 * https://neurosnap.ai/service/RFdiffusion3
 */
async function submitMotifScaffoldingJob(pdbPath, contig, options = {}) {
  // Default parameters for RFdiffusion3, unless `options` is provided
  const {
    numberDesigns = "1",
    timesteps = "10",
    stepScale = "1.5",
  } = options;

  // Create FormData object for the API request
  const formData = new FormData();
  formData.append("Input Structure", new Blob([fs.readFileSync(pdbPath)]), "motif.pdb");
  formData.append("Contig", contig);
  formData.append("Number Designs", numberDesigns);
  formData.append("Timesteps", timesteps);
  formData.append("Step Scale", stepScale);

  // Submit the job to the API
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "X-API-KEY": process.env.NEUROSNAP_API_KEY },
    body: formData,
  });

  const jobId = await response.json();
  if (!response.ok) throw new Error(jobId.error || response.statusText);

  console.log("Job submitted! ID:", jobId);
  return jobId;
}

/**
 * downloadJobResults
 *
 * Uses Neurosnap's API to download all output files from a completed job to a local directory
 * https://neurosnap.ai/blog/post/full-neurosnap-api-tutorial-the-quick-easy-api-for-bioinformatics/66b00dacec3f2aa9b4be703a
 */
async function downloadJobResults(jobId, outputDir = "./results") {
  const headers = { "X-API-KEY": process.env.NEUROSNAP_API_KEY };

  // Fetch the list of output file names for jobId from Neurosnap
  const data = await fetch(`${BASE_URL}/api/job/data/${jobId}`, { headers }).then(r => r.json());
  const files = data.out ?? [];

  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Downloading ${files.length} file(s) to ${outputDir}/`);

  for (const [filename] of files) {
    const buffer = await fetch(`${BASE_URL}/api/job/file/${jobId}/out/${filename}`, { headers })
      .then(r => r.arrayBuffer());
    fs.writeFileSync(`${outputDir}/${filename}`, Buffer.from(buffer));
    console.log(`${filename}`);
  }
}

/*
Example Usage

jobId = submitMotifScaffoldingJob(
  "./4zxb_cropped.pdb",
  "40-120,E6-155",        // contig: motif segment (E6-155) + inpaint segment (40-120)
  {
    numberDesigns: "1",
    timesteps: "10",
    stepScale: "1.5",
  }
);

downloadJobResults(jobId);
*/