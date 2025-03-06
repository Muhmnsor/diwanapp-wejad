
import { useMemo } from 'react';

export const useTaskGroups = (tasks: any[], groupBy: 'workspace' | 'status' | 'assignee') => {
  const { groupedTasks, groupNames } = useMemo(() => {
    const groups: Record<string, any[]> = {};
    const names: Record<string, string> = {};
    
    tasks.forEach(task => {
      let groupKey = '';
      let groupName = '';
      
      if (groupBy === 'workspace') {
        groupKey = task.workspace_id || 'undefined';
        groupName = task.workspace_name || 'غير محدد';
      } else if (groupBy === 'status') {
        groupKey = task.status || 'undefined';
        
        // تحويل حالة المهمة إلى نص مفهوم بالعربية
        switch (task.status) {
          case 'completed':
            groupName = 'مكتملة';
            break;
          case 'in_progress':
            groupName = 'قيد التنفيذ';
            break;
          case 'pending':
            groupName = 'معلقة';
            break;
          case 'delayed':
            groupName = 'متأخرة';
            break;
          default:
            groupName = task.status || 'غير محدد';
        }
      } else if (groupBy === 'assignee') {
        groupKey = task.assigned_to || 'undefined';
        groupName = task.assigned_user_name || 'غير مسند';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
        names[groupKey] = groupName;
      }
      
      groups[groupKey].push(task);
    });
    
    return {
      groupedTasks: groups,
      groupNames: names
    };
  }, [tasks, groupBy]);
  
  return { groupedTasks, groupNames };
};
