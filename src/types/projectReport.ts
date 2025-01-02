export interface ProjectReport {
  id: string;
  project_id: string;
  activity_id: string;
  program_name?: string;
  report_name: string;
  report_text: string;
  detailed_description?: string;
  activity_duration?: string;
  attendees_count?: string;
  objectives?: string;
  impact_on_participants?: string;
  photos?: ReportPhoto[];
  created_at: string;
  video_links?: string[];
  additional_links?: string[];
  files?: string[];
  comments?: string[];
  satisfaction_level?: number;
  activity_objectives?: string;
}

export interface ReportPhoto {
  url: string;
  description: string;
}