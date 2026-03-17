import { Readable } from "node:stream";
import * as web from "node:stream/web";

/**
 * Enum describing the statuses of a neurosnap job
 *
 * Source : https://neurosnap.ai/blog/post/full-neurosnap-api-tutorial-the-quick-easy-api-for-bioinformatics/66b00dacec3f2aa9b4be703a
 * go to the section for /api/job/status/JOB_ID
 */
export enum NeurosnapJobStatus {
  PENDING = "pending",
  RUNNING = "running",
  FAILED = "failed",
  COMPLETED = "completed",
  DELETED = "deleted",
  CANCELLED = "cancelled",
}

export async function sendNewRfDiffusion3Job(
  file: Blob,
  fileOriginalName: string,
  contig: string,
  numDesigns: string,
  timeSteps: string,
  stepScale: string,
): Promise<string> {
  const formData = new FormData();
  formData.append("Input Structure", file, fileOriginalName);
  formData.append("Contig", contig);
  formData.append("Number Designs", numDesigns);
  formData.append("Timesteps", timeSteps);
  formData.append("Step Scale", stepScale);
  const response = await fetch(
    "https://neurosnap.ai/api/job/submit/RFdiffusion3",
    {
      method: "POST",
      headers: { "X-API-KEY": process.env.NEUROSNAP_API_KEY! },
      body: formData,
    },
  );

  const payload: string = await response.json(); // the ID
  if (!response.ok) {
    throw new Error(
      `Job sent to RfDiffusion 3 Failed Status: ${response.status} Text: ${response.statusText}`,
    );
  }
  return payload;
}

/**
 * getStreamFromUrl
 * @param url
 * @returns A promise to a stream for the file from neurosnap
 */
export async function getStreamFromNeurosnapFileUrl(
  url: string,
): Promise<Readable> {
  const resp = await fetch(url, {
    headers: { "X-API-KEY": process.env.NEUROSNAP_API_KEY! },
  });

  if (!resp.ok || !resp.body) {
    throw new Error(`Could not fetch result of ${url}. Code: ${resp.status}`);
  }

  return Readable.fromWeb(resp.body as web.ReadableStream);
}

/**
 * getJobStatus
 *
 * returns the status of a job on neurosnap
 */
export async function getJobStatus(jobId: string): Promise<NeurosnapJobStatus> {
  const url = `https://neurosnap.ai/api/job/status/${jobId}`;

  const resp = await fetch(url, {
    headers: { "X-API-KEY": process.env.NEUROSNAP_API_KEY! },
  });

  if (!resp.ok || !resp.body) {
    throw new Error(`Could not fetch result of ${url}. Code: ${resp.status}`);
  }

  const json: string = await resp.json(); // per API docs, a string is returned

  return json as NeurosnapJobStatus;
}

/**
 * getNeurosnapJobOutput
 *
 * returns the url to a job's output file
 */
export function getNeurosnapJobOutput(jobId: string): string {
  const url = `https://neurosnap.ai/api/job/file/${jobId}/out/design_1.pdb`;
  return url;
}
