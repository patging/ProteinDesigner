export interface Task {
  workflowJobId: string;
  file: Blob;
  fileOriginalName: string;
  contig: string;
  numDesigns: string;
  timeSteps: string;
  stepScale: string;
}
