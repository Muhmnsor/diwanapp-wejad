
import { GanttHeader } from './gantt/GanttHeader';
import { TaskRow } from './gantt/TaskRow';

interface GanttChartProps {
  tasks: any[]; 
  months: Date[];
  today: Date;
  zoomLevel: number;
}

export const GanttChart = ({ tasks, months, today, zoomLevel }: GanttChartProps) => {
  if (!tasks || tasks.length === 0) {
    return null;
  }

  return (
    <div>
      {/* Header with months */}
      <GanttHeader months={months} groupByLabel="المشاريع" />
      
      {/* All tasks without grouping */}
      <div className="mt-4 border rounded-md bg-white">
        {tasks.map(task => (
          <TaskRow 
            key={task.id} 
            task={task} 
            months={months}
            today={today}
          />
        ))}
      </div>
    </div>
  );
};
