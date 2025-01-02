import { ProjectReport } from './projectReport';

export interface EventReport {
  id: string;
  event_id: string | null;
  executor_id: string | null;
  report_name: string;
  report_text: string;
  detailed_description?: string | null;
  duration: string;
  attendees_count?: string | null;
  objectives: string;
  impact_on_participants?: string | null;
  photos?: any[];
  created_at: string;
  video_links?: string[];
  additional_links?: string[];
  files?: string[];
  comments?: string[];
  satisfaction_level?: number | null;
}

// Re-export ProjectReport type for consistency
export type { ProjectReport };