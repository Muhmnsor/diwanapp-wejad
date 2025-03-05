
import { Task } from "@/types/workspace";
import { isWithinInterval, isSameDay } from "date-fns";

export const isTaskInDay = (task: Task, date: Date) => {
  if (!task.start_date || !task.end_date) return false;
  
  const taskStartDate = new Date(task.start_date);
  const taskEndDate = new Date(task.end_date);
  
  return isWithinInterval(date, { start: taskStartDate, end: taskEndDate }) ||
         isSameDay(date, taskStartDate) ||
         isSameDay(date, taskEndDate);
};

export const getTaskStatusColor = (status: string) => {
  switch(status) {
    case 'completed':
      return 'bg-green-500';
    case 'in_progress':
      return 'bg-blue-500';
    case 'pending':
      return 'bg-amber-500';
    case 'delayed':
      return 'bg-red-500';
    default:
      return 'bg-gray-300';
  }
};

// Calculate percentage of task completion based on time elapsed
export const getTimeBasedProgress = (startDate: Date, endDate: Date, today = new Date()) => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const current = today.getTime();
  
  // If task hasn't started yet
  if (current < start) return 0;
  
  // If task is already completed (past due date)
  if (current > end) return 100;
  
  // Calculate progress percentage based on time elapsed
  const totalDuration = end - start;
  const elapsed = current - start;
  
  return Math.min(100, Math.round((elapsed / totalDuration) * 100));
};
