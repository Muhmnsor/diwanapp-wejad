import { BaseReport } from "./sharedReport";

export interface EventReport extends BaseReport {
  event_id: string;
  duration: string;
  objectives: string;
  profiles?: {
    id: string;
    email: string;
  } | null;
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