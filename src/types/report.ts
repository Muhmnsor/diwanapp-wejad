import { EventReport } from './eventReport';
import { ProjectReport } from './projectReport';

export type { 
  EventReport,
  ProjectReport,
};

// Legacy type for backward compatibility
export type Report = EventReport;