import { EventReport } from './eventReport';
import { ProjectActivityReport } from './projectActivityReport';

export interface ReportPhoto {
  url: string;
  description: string;
}

export interface BaseReportFormFields {
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

// Legacy type for backward compatibility
export type Report = EventReport;

// New type for activity reports
export type ActivityReport = ProjectActivityReport;