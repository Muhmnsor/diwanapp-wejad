import { EventReport } from '@/types/eventReport';
import { downloadReport } from '@/components/reports/shared/handlers/sharedReportHandlers';

export const downloadEventReport = async (report: EventReport, eventTitle?: string): Promise<boolean> => {
  return downloadReport(report, eventTitle);
};

export const validateEventReport = (report: Partial<EventReport>): boolean => {
  if (!report.report_name || !report.report_text) {
    return false;
  }
  return true;
};