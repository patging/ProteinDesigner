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
