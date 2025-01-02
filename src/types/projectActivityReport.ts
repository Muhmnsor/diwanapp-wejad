import { BaseReport } from "@/components/reports/shared/types";

export interface ProjectActivityReport extends BaseReport {
  project_id: string | null;
  activity_id: string | null;
  executor_id: string | null;
  profiles?: {
    id: string;
    email: string;
  } | null;
  events?: {
    title: string;
  } | null;
}