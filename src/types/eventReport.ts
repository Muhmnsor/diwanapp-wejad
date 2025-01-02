import { BaseReport, ReportFormData } from "./sharedReport";

export interface EventReport extends BaseReport {
  event_id: string | null;
  executor_id: string | null;
  profiles?: {
    id: string;
    email: string;
  } | null;
}

export interface EventReportFormData extends ReportFormData {
  event_id?: string;
  executor_id?: string;
}