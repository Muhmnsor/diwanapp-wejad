export interface ProjectActivityReport {
  id: string;
  project_id: string | null;
  activity_id: string | null;
  executor_id: string | null;
  program_name: string | null;
  report_name: string;
  report_text: string;
  detailed_description: string | null;
  activity_duration: string | null;
  attendees_count: string | null;
  activity_objectives: string | null;
  impact_on_participants: string | null;
  photos: string[] | null;
  created_at: string;
  profiles?: {
    id: string;
    email: string;
  } | null;
  events?: {
    title: string;
  } | null;
}