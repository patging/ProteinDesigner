export interface JobStatusModel {
  job_status_id: number;
  job_status_message: string;
}

export interface JobModel {
  job_id: string;
  user_id: string;
  job_input_file_url: string;
  job_contig_string: string;
  job_status_id: number;
  job_api_job_id: string;
  job_start_time: string | null;
  job_end_time: string | null;
}

export interface JobResultsModel {
  job_result_id: number;
  job_id: string;
  job_result_file_url: string;
  job_result_score: number;
  job_result_is_favorite: boolean;
}
