import { ProjectReport } from '@/types/projectReport';
import { downloadReport as downloadReportUtil } from '@/utils/reports/downloadReport';

export const downloadReport = async (report: ProjectReport): Promise<void> => {
  return downloadReportUtil(report);
};

export const validateProjectReport = (report: Partial<ProjectReport>): boolean => {
  if (!report.report_name || !report.report_text) {
    return false;
  }
  return true;
};