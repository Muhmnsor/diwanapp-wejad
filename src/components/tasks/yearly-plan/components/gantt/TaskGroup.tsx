
import { TaskRow } from './TaskRow';

interface TaskGroupProps {
  groupKey: string;
  groupName: string;
  tasks: any[];
  months: Date[];
  today: Date;
}

export const TaskGroup = ({ groupKey, groupName, tasks, months, today }: TaskGroupProps) => {
  return (
    <div className="space-y-2">
      {/* Group header */}
      <div className="flex">
        <div className="w-48 flex-shrink-0 font-medium py-2 bg-gray-50 px-3 rounded-md">
          {groupName}
          <span className="text-xs text-gray-500 mr-2">
            ({tasks.length})
          </span>
        </div>
        <div className="flex-1"></div>
      </div>
      
      {/* Tasks in this group */}
      {tasks.map(task => (
        <TaskRow 
          key={task.id}
          task={task}
          months={months}
          today={today}
        />
      ))}
    </div>
  );
};
