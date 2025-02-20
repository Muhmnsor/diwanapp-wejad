
export interface EventReportFormValues {
  report_name: string;
  report_text: string;
  objectives: string;
  impact_on_participants: string;
  speaker_name: string;
  attendees_count: number;
  absent_count: number;
  satisfaction_level: number;
  partners: string;
  links: string;
  photos: (string | PhotoData | null)[];
  photo_descriptions?: string[];
}

export interface PhotoData {
  url: string | { url: string };
}

export interface Photo {
  url: string;
  description: string;
  index: number;
}

export interface EventReportFormProps {
  eventId: string;
  onClose: () => void;
  initialData?: EventReportFormValues & { id: string };
  mode?: 'create' | 'edit';
}
