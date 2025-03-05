
import { useState, useEffect } from 'react';

export const useTaskGroups = (tasks: any[], groupBy: 'workspace' | 'status' | 'assignee') => {
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

  return { groupedTasks, groupNames };
};
