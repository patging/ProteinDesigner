import {
  JobModel,
  JobParametersModel,
  JobResultsModel,
  JobStatusModel,
} from "../models/supabaseModels.js";
import { supabaseService } from "./supabaseClient.js";

export enum WorkflowJobStatus {
  COMPLETED = "completed",
  INQUEUE = "inqueue",
  RUNNING = "running",
  FAILED = "failed",
}

export async function getStatus(
  status: WorkflowJobStatus,
): Promise<JobStatusModel> {
  const { data, error } = await supabaseService
    .from("job_status")
    .select("*")
    .eq("job_status_message", status.valueOf());

  if (error) {
    throw error;
  } else if (!data) {
    throw new Error(`Status ${status} not found`);
  }

  const results = data as unknown[] as JobStatusModel[];
  if (results.length === 0) {
    throw new Error(`Status ${status.toString()} was not found`);
  }

  return results[0]!;
}

export async function insertNewJob(
  job_input_file_url: string,
  job_contig_string: string | null,
  job_status: WorkflowJobStatus,
  job_api_job_id: string | null,
): Promise<JobModel> {
  const USERID = "4a35f59d-6452-4f2f-8643-897613bad336"; // VERY TEMPORARY TO:DO DELETE

  const status: JobStatusModel = await getStatus(job_status);
  const status_id = status.job_status_id;
  const { data, error } = await supabaseService
    .from("jobs")
    .insert({
      user_id: USERID,
      job_input_file_url: job_input_file_url,
      job_contig_string: job_contig_string,
      job_status_id: status_id,
      job_api_job_id: job_api_job_id,
    })
    .select();

  if (error) {
    throw error;
  }

  const results = data as unknown[] as JobModel[];
  if (results.length === 0) {
    throw new Error(`No rows found when submitted. API_ID=${job_api_job_id}`);
  }

  return results[0]!;
}

export async function updateJobStatus(
  workflowJobID: string,
  newStatus: WorkflowJobStatus,
) {
  const status: JobStatusModel = await getStatus(newStatus);
  const status_id = status.job_status_id;

  const { error } = await supabaseService
    .from("jobs")
    .update({ job_status_id: status_id })
    .eq("job_id", workflowJobID);

  if (error) {
    throw error;
  }
}

export async function updateJobStartTime(
  workflowJobID: string,
  timeStamp: string,
) {
  const { error } = await supabaseService
    .from("jobs")
    .update({ job_start_time: timeStamp })
    .eq("job_id", workflowJobID);

  if (error) {
    throw error;
  }
}

export async function updateJobEndTime(
  workflowJobID: string,
  timeStamp: string,
) {
  const { error } = await supabaseService
    .from("jobs")
    .update({ job_end_time: timeStamp })
    .eq("job_id", workflowJobID);

  if (error) {
    throw error;
  }
}

export async function updateJobApiJobId(
  workflowJobID: string,
  jobApiJobId: string,
) {
  const { error } = await supabaseService
    .from("jobs")
    .update({ job_api_job_id: jobApiJobId })
    .eq("job_id", workflowJobID);

  if (error) {
    throw error;
  }
}

export async function insertJobResults(
  workflow_job_id: string,
  job_result_file_url: string,
  job_result_score: number,
  job_result_is_favorite: boolean,
): Promise<JobResultsModel> {
  const { data, error } = await supabaseService
    .from("job_results")
    .insert({
      job_id: workflow_job_id,
      job_result_file_url: job_result_file_url,
      job_result_score: job_result_score,
      job_result_is_favorite: job_result_is_favorite,
    })
    .select();

  if (error) {
    throw error;
  }

  const results = data as unknown[] as JobResultsModel[];
  if (results.length === 0) {
    throw new Error(
      `No rows found when submitted. workflowjobID=${workflow_job_id}`,
    );
  }

  return results[0]!;
}

export async function insertJobParameters(
  job_id: string,
  contig: string,
  numDesigns: string,
  timeSteps: string,
  stepScale: string,
): Promise<JobParametersModel[]> {
  const { data, error } = await supabaseService
    .from("job_parameters")
    .insert([
      {
        job_id: job_id,
        job_parameter_param_key: "contig",
        job_parameter_param_value: contig,
      },
      {
        job_id: job_id,
        job_parameter_param_key: "numDesigns",
        job_parameter_param_value: numDesigns,
      },
      {
        job_id: job_id,
        job_parameter_param_key: "timeSteps",
        job_parameter_param_value: timeSteps,
      },
      {
        job_id: job_id,
        job_parameter_param_key: "stepScale",
        job_parameter_param_value: stepScale,
      },
    ])
    .select();

  if (error) {
    throw error;
  }

  const results = data as unknown[] as JobParametersModel[][];
  if (results.length === 0) {
    throw new Error(
      `No rows found when submitted in job_parameters. job_id=${job_id}`,
    );
  }
  return results[0]!;
}
