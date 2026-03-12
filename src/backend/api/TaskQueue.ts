import * as fastq from "fastq";
import type { queueAsPromised } from "fastq";

import { Task } from "../models/taskQueueModels.js";
import { rfDiffusion3Workflow } from "../workflows/rfDuffusion3Workflow.js";

async function worker(task: Task) {
  console.log(
    `Called job workflowID=${task.workflowJobId}, neurosnapJobID=${task.neurosnapJobId}`,
  );

  await rfDiffusion3Workflow(task.workflowJobId, task.neurosnapJobId);
  return true;
}

export const taskQueue: queueAsPromised<Task> = fastq.promise(worker, 1);
