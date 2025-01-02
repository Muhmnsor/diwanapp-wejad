export interface EventReport {
  id: string;
  event_id: string;
  executor_id: string;
  program_name: string | null;
  report_name: string;
  report_text: string;
  detailed_description: string | null;
  activity_duration: string;
  attendees_count: string;
  activity_objectives: string;
  impact_on_participants: string;
  photos: { url: string; description: string; }[];
  created_at: string;
  video_links?: string[];
  additional_links?: string[];
  files?: string[];
  comments?: string[];
  satisfaction_level?: number | null;
  profiles?: {
    email: string;
  };
}

export interface EventReportFormData {
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