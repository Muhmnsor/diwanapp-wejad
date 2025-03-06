
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
    return (
      <div className="py-10 text-center text-gray-500">
        لا توجد مشاريع لعرضها في الخطة السنوية
      </div>
    );
  }

  return (
    <div>
      {/* Header with months */}
      <GanttHeader months={months} groupByLabel="المشاريع" />
      
      {/* All tasks without grouping */}
      <div className="mt-4 border rounded-md bg-white overflow-hidden">
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
