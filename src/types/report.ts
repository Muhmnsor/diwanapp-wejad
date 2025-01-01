export interface Report {
  id: string;
  event_id?: string;
  activity_id?: string;
  report_text: string;
  photos: any[];
  video_links?: string[];
  additional_links?: string[];
  created_at: string;
  satisfaction_level?: number | null;
  files?: string[];
  comments?: string[];
  event_duration?: string;
  activity_duration?: string;
  attendees_count: string;
  event_objectives?: string;
  activity_objectives?: string;
  impact_on_participants: string;
  detailed_description: string;
  report_name: string;
  program_name?: string;
  profiles?: {
    id: string;
    email: string;
  };
}