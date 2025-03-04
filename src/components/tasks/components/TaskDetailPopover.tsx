
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Task } from "../hooks/useAssignedTasks";
import { getStatusIcon, getStatusText } from "../utils/taskFormatters";

interface TaskDetailPopoverProps {
  task: Task;
}

export const TaskDetailPopover = ({ task }: TaskDetailPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-right hover:underline cursor-pointer font-medium">{task.title}</button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h3 className="font-bold text-lg">{task.title}</h3>
          <p className="text-gray-600 text-sm">{task.description || 'لا يوجد وصف'}</p>
          <div className="flex items-center mt-2 gap-2">
            {getStatusIcon(task.status)}
            <span className="text-sm text-gray-500">{getStatusText(task.status)}</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
