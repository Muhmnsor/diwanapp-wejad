import { BaseReport } from "./sharedReport";

export interface EventReport extends BaseReport {
  event_id: string | null;
  executor_id: string | null;
}

export interface EventReportFormData {
  program_name: string;
  report_name: string;
  report_text: string;
  detailed_description: string;
  duration: string;
  attendees_count: string;
  objectives: string;
  impact_on_participants: string;
  photos: { url: string; description: string; }[];
}