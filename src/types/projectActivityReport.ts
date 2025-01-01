export interface ProjectActivityReport {
  id: string;
  project_id: string;
  activity_id: string;
  executor_id: string;
  program_name?: string;
  report_name: string;
  report_text: string;
  detailed_description?: string;
  activity_duration?: string;
  attendees_count?: string;
  activity_objectives?: string;
  impact_on_participants?: string;
  photos?: { url: string; description: string; }[];
  created_at: string;
  profiles?: {
    id: string;
    email: string;
  };
  // Adding fields to match Report type for compatibility
  event_id?: string;
  event_duration?: string;
  event_objectives?: string;
}