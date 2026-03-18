import { setTimeout } from "timers/promises";
import { v4 as uuidv4 } from "uuid";

import {
  getJobStatus,
  getNeurosnapJobOutput,
  NeurosnapJobStatus,
  sendNewRfDiffusion3Job,
} from "../api/neurosnapAPI.js";
import {
  insertJobResults,
  updateJobApiJobId,
  updateJobStartTime,
  updateJobEndTime,
  updateJobStatus,
  WorkflowJobStatus,
} from "../api/supabaseService.js";
import { uploadFile } from "../api/azureBlobAPI.js";

export async function rfDiffusion3Workflow(
  workflowJobId: string,
  file: Blob,
  fileOriginalName: string,
  contig: string,
  numDesigns: string,
  timeSteps: string,
  stepScale: string,
): Promise<Boolean> {
  console.log("Made it to func", workflowJobId);
  // set status to running
  const timeNow = new Date();
  await updateJobStartTime(workflowJobId, timeNow.toISOString());
  await updateJobStatus(workflowJobId, WorkflowJobStatus.RUNNING);
  console.log("going to send the job!");
  // sending the job
  const neurosnapJobId = await sendNewRfDiffusion3Job(
    file,
    fileOriginalName,
    contig,
    numDesigns,
    timeSteps,
    stepScale,
  );

  // update entry in the database for this RFDiffusionJob
  await updateJobApiJobId(workflowJobId, neurosnapJobId);

  console.log("done sending job");
  // wait for the job to finish
  let completed: boolean = false;
  for (let i = 0; i < 10; i++) {
    const status: NeurosnapJobStatus = await getJobStatus(neurosnapJobId);
    console.log(neurosnapJobId, " status is ", status.valueOf());
    if (
      status == NeurosnapJobStatus.FAILED ||
      status == NeurosnapJobStatus.CANCELLED ||
      status == NeurosnapJobStatus.DELETED
    ) {
      throw new Error(
        `Job ID ${neurosnapJobId} returned status of ${status.valueOf()}`,
      );
    }

    if (status == NeurosnapJobStatus.COMPLETED) {
      completed = true;
      break;
    }
    await setTimeout(60000); // wait one min
  }
  // if the status isn't completed return an error
  if (!completed) {
    await updateJobStatus(workflowJobId, WorkflowJobStatus.FAILED);
    throw new Error(
      `Job ID ${neurosnapJobId} did not complete within 10 minutes`,
    );
  } else {
    await updateJobStatus(workflowJobId, WorkflowJobStatus.COMPLETED);
    const now = new Date(); // roughly the time it ended
    await updateJobEndTime(workflowJobId, now.toISOString());
  }
  // update the result status
  for (let i = 1; i <= parseInt(numDesigns); i++) {
    console.log("getting output!", workflowJobId);
    const resultUrl = getNeurosnapJobOutput(neurosnapJobId, i);

    console.log("Uploading to azure!", workflowJobId);
    const newFileName = `${uuidv4()}.pdb`;
    const blobUrl = await uploadFile(resultUrl, newFileName);

    console.log("posting to supa!", workflowJobId);
    await insertJobResults(workflowJobId, blobUrl, 100, false);
  }
  console.log("Done!", workflowJobId);
  return true;
}
