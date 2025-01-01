export interface Report {
  id: string;
  created_at: string;
  report_text: string;
  detailed_description: string;
  event_duration: string;
  attendees_count: string;
  event_objectives: string;
  impact_on_participants: string;
  photos: { url: string; description: string; }[];
  event_id: string;
  report_name: string;
  program_name?: string;
  profiles?: {
    id: string;
    email: string;
  } | null;
}