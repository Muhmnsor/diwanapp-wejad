import { BaseReport } from "./sharedReport";

export interface EventReport extends BaseReport {
  event_id: string | null;
  executor_id: string | null;
  profiles?: {
    id: string;
    email: string;
  } | null;
  events?: {
    title: string;
  } | null;
}