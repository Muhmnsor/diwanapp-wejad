
import { format, getDaysInMonth, isWithinInterval, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import { TaskBar } from './TaskBar';

interface TaskRowProps {
  task: any;
  months: Date[];
  today: Date;
}

export const TaskRow = ({ task, months, today }: TaskRowProps) => {
  return (
    <div className="flex my-1">
      <div className="w-48 flex-shrink-0 text-sm py-1 px-3 font-medium truncate" title={task.title}>
        {task.title}
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
