
import { TaskBar } from './TaskBar';
import { Badge } from '@/components/ui/badge';
import { getTaskStatusColor } from '../../utils/dateUtils';

interface TaskRowProps {
  task: any;
  months: Date[];
  today: Date;
}

export const TaskRow = ({ task, months, today }: TaskRowProps) => {
  const getStatusText = (status: string) => {
    switch(status) {
      case 'completed': return 'مكتمل';
      case 'in_progress': return 'قيد التنفيذ';
      case 'pending': return 'معلق';
      case 'delayed': return 'متأخر';
      default: return status;
    }
  };

  return (
    <div className="flex my-1 hover:bg-gray-50">
      <div className="w-48 flex-shrink-0 py-1 px-3 font-medium">
        <div className="flex flex-col">
          <span className="truncate text-sm" title={task.title}>
            {task.title}
          </span>
          <Badge 
            className={`mt-1 text-xs ${getTaskStatusColor(task.status)} text-white w-fit`}
            variant="outline"
          >
            {getStatusText(task.status)}
          </Badge>
        </div>
      </div>
      <div className="flex-1 flex">
        {months.map((month, monthIndex) => (
          <div key={monthIndex} className="flex-1 relative border-r h-8">
            <TaskBar
              task={task}
              month={month}
              monthIndex={monthIndex}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
