import * as fastq from "fastq";
import type { queueAsPromised } from "fastq";

import { Task } from "../models/taskQueueModels.js";
import { rfDiffusion3Workflow } from "../workflows/rfDuffusion3Workflow.js";

async function worker(task: Task) {
  console.log(`Called job workflowID=${task.workflowJobId}`);

  await rfDiffusion3Workflow(
    task.workflowJobId,
    task.file,
    task.fileOriginalName,
    task.contig,
    task.numDesigns,
    task.timeSteps,
    task.stepScale,
  );
  return true;
}

export const taskQueue: queueAsPromised<Task> = fastq.promise(worker, 1);
