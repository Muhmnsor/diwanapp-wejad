
import { TaskBar } from './TaskBar';

interface TaskRowProps {
  task: any;
  months: Date[];
  today: Date;
}

export const TaskRow = ({ task, months, today }: TaskRowProps) => {
  return (
    <div className="flex hover:bg-gray-50 border-b border-gray-100">
      <div className="w-48 flex-shrink-0 py-1 px-3 font-medium">
        <div className="flex flex-col">
          <span className="truncate text-sm" title={task.title}>
            {task.title}
          </span>
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
