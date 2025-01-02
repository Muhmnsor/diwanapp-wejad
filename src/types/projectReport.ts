export interface ProjectReport {
  id: string;
  project_id: string | null;
  activity_id: string | null;
  executor_id: string | null;
  program_name?: string | null;
  report_name: string;
  report_text: string;
  detailed_description?: string | null;
  activity_duration: string;
  attendees_count?: string | null;
  objectives: string;
  impact_on_participants?: string | null;
  photos?: { url: string; description: string; }[] | null;
  created_at: string;
  video_links?: string[];
  additional_links?: string[];
  files?: string[];
  comments?: string[];
  satisfaction_level?: number | null;
  profiles?: {
    id: string;
    email: string;
  } | null;
  events?: {
    title: string;
  } | null;
}

export interface ProjectReportFormData {
  project_id?: string;
  activity_id?: string;
  executor_id?: string;
  program_name: string;
  report_name: string;
  report_text: string;
  detailed_description: string;
  activity_duration: string;
  attendees_count: string;
  objectives: string;
  impact_on_participants: string;
  photos: { url: string; description: string; }[];
}