import { BaseReport } from "@/components/reports/shared/types";

export interface Report extends BaseReport {
  event_id: string;
  profiles?: {
    id: string;
    email: string;
  } | null;
}