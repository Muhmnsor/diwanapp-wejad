
import { ProjectReport } from '@/types/projectReport';
import { downloadProjectReport } from '@/utils/reports/downloadProjectReport';

export const downloadReport = async (report: ProjectReport): Promise<void> => {
  console.log("Downloading report with data:", report);
  return downloadProjectReport(report);
};

export const validateProjectReport = (report: Partial<ProjectReport>): boolean => {
  if (!report.report_name || !report.report_text) {
    return false;
  }
  return true;
};
