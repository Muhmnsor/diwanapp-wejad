
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
  activity_objectives: string;
  objectives: string;
  impact_on_participants?: string | null;
  photos?: ReportPhoto[] | null;
  created_at: string;
  video_links?: string[];
  additional_links?: string[];
  files?: string[];
  comments?: string[];
  satisfaction_level?: number | null;
  activity?: {
    id: string;
    title: string;
    description?: string;
    event_hours?: number;
    activity_duration?: number;
    activity_feedback?: Array<{
      overall_rating: number | null;
      content_rating: number | null;
      organization_rating: number | null;
      presenter_rating: number | null;
    }>;
    averageRatings?: {
      overall_rating: number | null;
      content_rating: number | null;
      organization_rating: number | null;
      presenter_rating: number | null;
      count: number;
    };
  };
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
  photos: ReportPhoto[];
}

export interface ReportPhoto {
  url: string;
  description: string;
  index?: number;
}
