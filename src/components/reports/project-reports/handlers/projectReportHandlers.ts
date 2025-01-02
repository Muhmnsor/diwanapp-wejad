import { ProjectReport } from '@/types/projectReport';
import { downloadReport } from '@/utils/reports/downloadReport';

export { downloadReport };

export const validateProjectReport = (report: Partial<ProjectReport>): boolean => {
  if (!report.report_name || !report.report_text) {
    return false;
  }
  return true;
};