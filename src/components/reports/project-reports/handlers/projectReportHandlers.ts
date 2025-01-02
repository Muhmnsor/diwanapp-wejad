import { ProjectReport } from '@/types/projectReport';
import { downloadReport } from '@/utils/reports/downloadReport';

export const downloadProjectReport = async (report: ProjectReport, projectTitle?: string): Promise<boolean> => {
  return downloadReport(report, projectTitle);
};

export const validateProjectReport = (report: Partial<ProjectReport>): boolean => {
  if (!report.report_name || !report.report_text) {
    return false;
  }
  return true;
};