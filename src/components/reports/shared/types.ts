export interface BaseReport {
  id: string;
  report_name: string;
  program_name?: string | null;
  report_text: string;
  detailed_description?: string | null;
  attendees_count?: string | null;
  impact_on_participants?: string | null;
  photos?: { url: string; description: string; }[] | null;
  created_at: string;
  video_links?: string[];
  additional_links?: string[];
  files?: string[];
  comments?: string[];
  satisfaction_level?: number | null;
  activity_objectives?: string;
  duration?: string;
}

export interface ReportFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export interface ReportActionsProps {
  onDelete: () => void;
  onDownload: () => void;
  onEdit: () => void;
  isDeleting?: boolean;
}

export interface ReportListProps {
  projectId?: string;
  activityId?: string;
}

export interface ReportMetadata {
  duration: string;
  attendeesCount: string;
  objectives: string;
  impactOnParticipants: string;
}

export interface ReportPhoto {
  url: string;
  description: string;
}