export interface ReportMetadataType {
  duration: string;
  attendeesCount: string;
  objectives: string;
  impactOnParticipants: string;
}

export interface ReportPhoto {
  url: string;
  description: string;
}

export interface ReportFormData {
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

export interface ReportActionsProps {
  onDelete: () => void;
  onDownload: () => void;
  onEdit: () => void;
  isDeleting?: boolean;
}