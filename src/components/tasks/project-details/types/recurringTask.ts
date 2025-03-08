
import { Task } from "./task";

export interface RecurringTask extends Task {
  recurrence_type: string;  // 'daily', 'weekly', 'monthly'
  interval: number;   // every X days/weeks/months
  day_of_month?: number | null;  // day of month for monthly recurrence
  next_generation_date: string | null;  // ISO date string
  last_generated_date: string | null;  // ISO date string
  is_active: boolean;  // whether the recurring task is active
  assign_to: string | null;  // user ID to assign generated tasks to
}
