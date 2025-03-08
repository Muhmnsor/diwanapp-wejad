
import { Task } from "./task";

export interface RecurringTask extends Task {
  frequency: string;  // 'daily', 'weekly', 'monthly'
  interval: number;   // every X days/weeks/months
  next_occurrence: string;  // ISO date string
}
