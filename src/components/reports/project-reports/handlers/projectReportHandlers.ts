import { ProjectReport } from '@/types/projectReport';
import { downloadReport as downloadReportUtil } from '@/utils/reports/downloadReport';

export const downloadReport = async (report: ProjectReport, title?: string): Promise<boolean> => {
  return downloadReportUtil(report, title);
};

export const validateProjectReport = (report: Partial<ProjectReport>): boolean => {
  if (!report.report_name || !report.report_text) {
    return false;
  }
  return true;
};