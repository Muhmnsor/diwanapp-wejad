
import { useTaskGroups } from './gantt/useTaskGroups';
import { GanttHeader } from './gantt/GanttHeader';
import { TaskGroup } from './gantt/TaskGroup';

interface GanttChartProps {
  tasks: any[]; 
  months: Date[];
  groupBy: 'workspace' | 'status' | 'assignee';
  today: Date;
  zoomLevel: number;
}

export const GanttChart = ({ tasks, months, groupBy, today, zoomLevel }: GanttChartProps) => {
  const { groupedTasks, groupNames } = useTaskGroups(tasks, groupBy);

  // Determine the group label based on groupBy
  const getGroupByLabel = () => {
    switch(groupBy) {
      case 'workspace': return 'مساحة العمل';
      case 'status': return 'الحالة';
      case 'assignee': return 'المسؤول';
      default: return '';
    }
  };

  return (
    <div>
      {/* Header with months */}
      <GanttHeader months={months} groupByLabel={getGroupByLabel()} />
      
      {/* Groups and tasks */}
      <div className="mt-4 space-y-6">
        {Object.keys(groupedTasks).map(groupKey => (
          <TaskGroup 
            key={groupKey}
            groupKey={groupKey}
            groupName={groupNames[groupKey]}
            tasks={groupedTasks[groupKey]}
            months={months}
            today={today}
          />
        ))}
      </div>
    </div>
  );
};
