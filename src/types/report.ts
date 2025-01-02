export interface ReportPhoto {
  url: string;
  description: string;
}

export interface ReportFormFields {
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
