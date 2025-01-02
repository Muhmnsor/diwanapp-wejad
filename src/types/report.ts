export type { EventReport } from './eventReport';
export type { ProjectReport } from './projectReport';
export type { 
  BaseReport, 
  ReportFormProps, 
  ReportActionsProps, 
  ReportListProps,
  ReportMetadata,
  ReportPhoto
} from '@/components/reports/shared/types';

// Legacy type for backward compatibility
export type Report = EventReport;