import { ProjectReport } from '@/types/projectReport';
import { downloadProjectReport } from '@/utils/reports/downloadReport';

export const downloadReport = async (report: ProjectReport, projectTitle?: string): Promise<boolean> => {
  return downloadProjectReport(report, projectTitle);
};

export const validateProjectReport = (report: Partial<ProjectReport>): boolean => {
  if (!report.report_name || !report.report_text) {
    return false;
  }
  return true;
};