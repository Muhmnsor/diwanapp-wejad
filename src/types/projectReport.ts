import { BaseReport } from "./sharedReport";

export interface ProjectReport extends BaseReport {
  project_id: string | null;
  activity_id: string | null;
  executor_id: string | null;
  activity_duration: string;
  activity_objectives: string;
  profiles?: {
    id: string;
    email: string;
  } | null;
  events?: {
    title: string;
  } | null;
}

export interface ProjectReportFormData {
  program_name: string;
  report_name: string;
  report_text: string;
  detailed_description: string;
  activity_duration: string;
  attendees_count: string;
  activity_objectives: string;
  impact_on_participants: string;
  photos: { url: string; description: string; }[];
}