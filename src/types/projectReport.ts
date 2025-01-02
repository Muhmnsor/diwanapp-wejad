import { BaseReport, ReportFormData } from "./sharedReport";

export interface ProjectReport extends BaseReport {
  project_id: string | null;
  activity_id: string | null;
  executor_id: string | null;
  profiles?: {
    id: string;
    email: string;
  } | null;
  events?: {
    title: string;
  } | null;
}

export interface ProjectReportFormData extends ReportFormData {
  project_id?: string;
  activity_id?: string;
  executor_id?: string;
}