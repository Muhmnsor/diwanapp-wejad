
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
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
    default:
      return 'bg-gray-300';
  }
};

export const formatDateRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return `${format(start, 'yyyy/MM/dd', { locale: ar })} - ${format(end, 'yyyy/MM/dd', { locale: ar })}`;
};
