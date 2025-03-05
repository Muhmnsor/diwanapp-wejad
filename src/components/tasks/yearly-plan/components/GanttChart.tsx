
import { format, getDaysInMonth, isWithinInterval, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import { getTaskStatusColor } from '../utils/dateUtils';
import { useEffect, useState } from 'react';

interface GanttChartProps {
  tasks: any[]; // Using any for task projects data
  months: Date[];
  groupBy: 'workspace' | 'status' | 'assignee';
  today: Date;
  zoomLevel: number;
}

export const GanttChart = ({ tasks, months, groupBy, today, zoomLevel }: GanttChartProps) => {
  const [groupedTasks, setGroupedTasks] = useState<Record<string, any[]>>({});
  const [groupNames, setGroupNames] = useState<Record<string, string>>({});

  // Group tasks based on groupBy parameter
  useEffect(() => {
    const grouped: Record<string, any[]> = {};
    const names: Record<string, string> = {};

    tasks.forEach(task => {
      let groupKey = '';
      let groupName = '';

      switch(groupBy) {
        case 'workspace':
          groupKey = task.workspace_id || 'no-workspace';
          groupName = task.workspace_name || 'بدون مساحة عمل';
          break;
        case 'status':
          groupKey = task.status || 'no-status';
          switch(task.status) {
            case 'completed': groupName = 'مكتمل'; break;
            case 'in_progress': groupName = 'قيد التنفيذ'; break;
            case 'pending': groupName = 'معلق'; break;
            case 'delayed': groupName = 'متأخر'; break;
            default: groupName = task.status || 'بدون حالة';
          }
          break;
        case 'assignee':
          groupKey = task.assigned_to || 'no-assignee';
          groupName = task.assigned_user_name || 'غير مسند';
          break;
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      
      grouped[groupKey].push(task);
      names[groupKey] = groupName;
    });

    setGroupedTasks(grouped);
    setGroupNames(names);
  }, [tasks, groupBy]);

  return (
    <div>
      {/* Header with months */}
      <div className="flex border-b pb-2">
        <div className="w-48 flex-shrink-0 font-bold">
          {groupBy === 'workspace' ? 'مساحة العمل' : 
           groupBy === 'status' ? 'الحالة' : 'المسؤول'}
        </div>
        <div className="flex-1 flex">
          {months.map((month, index) => (
            <div 
              key={index} 
              className="flex-1 text-center font-medium text-sm"
            >
              {format(month, 'MMMM', { locale: ar })}
            </div>
          ))}
        </div>
      </div>
      
      {/* Groups and tasks */}
      <div className="mt-4 space-y-6">
        {Object.keys(groupedTasks).map(groupKey => (
          <div key={groupKey} className="space-y-2">
            {/* Group header */}
            <div className="flex">
              <div className="w-48 flex-shrink-0 font-medium py-2 bg-gray-50 px-3 rounded-md">
                {groupNames[groupKey]}
                <span className="text-xs text-gray-500 mr-2">
                  ({groupedTasks[groupKey].length})
                </span>
              </div>
              <div className="flex-1"></div>
            </div>
            
            {/* Tasks in this group */}
            {groupedTasks[groupKey].map(task => (
              <TaskRow 
                key={task.id}
                task={task}
                months={months}
                today={today}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

interface TaskRowProps {
  task: any;
  months: Date[];
  today: Date;
}

const TaskRow = ({ task, months, today }: TaskRowProps) => {
  // Helper to check if a date falls within the task duration
  const isTaskActiveOnDay = (day: Date) => {
    if (!task.start_date || !task.due_date) return false;
    
    const taskStartDate = new Date(task.start_date);
    const taskEndDate = new Date(task.due_date);
    
    return isWithinInterval(day, { start: taskStartDate, end: taskEndDate }) ||
           isSameDay(day, taskStartDate) ||
           isSameDay(day, taskEndDate);
  };

  return (
    <div className="flex">
      <div className="w-48 flex-shrink-0 text-sm py-1 px-3">
        {task.title}
      </div>
      <div className="flex-1 flex">
        {months.map((month, monthIndex) => {
          const daysInMonth = getDaysInMonth(month);
          
          return (
            <div key={monthIndex} className="flex-1 relative">
              <div className="flex h-8 border-r">
                {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
                  const currentDay = new Date(month.getFullYear(), month.getMonth(), dayIndex + 1);
                  const isCurrentDay = isSameDay(currentDay, today);
                  
                  return (
                    <div 
                      key={dayIndex} 
                      className={`flex-1 h-full ${
                        isCurrentDay ? 'bg-yellow-100' : ''
                      }`}
                    />
                  );
                })}
              </div>
              
              <div className="relative h-8 mt-1">
                {task.start_date && task.due_date && (
                  <TaskBar
                    task={task}
                    month={month}
                    monthIndex={monthIndex}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface TaskBarProps {
  task: any;
  month: Date;
  monthIndex: number;
}

const TaskBar = ({ task, month, monthIndex }: TaskBarProps) => {
  const startDate = new Date(task.start_date);
  const endDate = new Date(task.due_date);
  
  // Check if task overlaps with this month
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  
  if (
    (endDate < monthStart) || 
    (startDate > monthEnd)
  ) {
    return null; // Task doesn't overlap with this month
  }
  
  // Calculate position and width
  const daysInMonth = getDaysInMonth(month);
  const monthStartDay = monthStart.getDate();
  
  // Task starts before this month
  const leftDay = startDate < monthStart 
    ? 0 
    : startDate.getDate() - 1;
  
  // Task ends after this month
  const rightDay = endDate > monthEnd 
    ? daysInMonth 
    : endDate.getDate();
  
  const left = (leftDay / daysInMonth) * 100;
  const width = ((rightDay - leftDay) / daysInMonth) * 100;
  
  return (
    <div
      style={{
        left: `${left}%`,
        width: `${width}%`,
      }}
      className={`absolute h-6 rounded-md px-1 text-xs text-white flex items-center overflow-hidden ${getTaskStatusColor(task.status)}`}
      title={`${task.title} (${
        task.priority === 'high' ? 'مرتفعة' : 
        task.priority === 'medium' ? 'متوسطة' : 
        'منخفضة'
      })`}
    >
      <span className="truncate">{task.title}</span>
    </div>
  );
};
