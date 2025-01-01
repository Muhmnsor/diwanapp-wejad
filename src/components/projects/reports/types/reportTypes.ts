export interface ReportFormData {
  reportName: string;
  programName: string;
  reportText: string;
  detailedDescription: string;
  activityDuration: string;
  attendeesCount: string;
  activityObjectives: string;
  impactOnParticipants: string;
  photos: { url: string; description: string; }[];
}