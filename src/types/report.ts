import { EventReport } from './eventReport';
import { ProjectReport } from './projectReport';
import { 
  BaseReport, 
  ReportFormProps, 
  ReportActionsProps, 
  ReportListProps,
  ReportMetadata,
  ReportPhoto
} from './sharedReport';

export type { 
  EventReport,
  ProjectReport,
  BaseReport,
  ReportFormProps,
  ReportActionsProps,
  ReportListProps,
  ReportMetadata,
  ReportPhoto
};

// Legacy type for backward compatibility
export type Report = EventReport;