
import { Badge } from "@/components/ui/badge";
import { Link2 } from "lucide-react";
import { Task } from "../types/task";

interface TaskHeaderProps {
  task: Task;
  status: string;
  hasDependencies: boolean;
  dependencyIconColor: string;
  onShowDependencies: () => void;
}

export const TaskHeader: React.FC<TaskHeaderProps> = ({
  task,
  status,
  hasDependencies,
  dependencyIconColor,
  onShowDependencies,
}) => {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-start">
        <h3 className="text-lg font-medium">
          {task.title}
          {task.parent_task_id && (
            <Badge variant="outline" className="ml-2 text-xs bg-gray-100">
              مهمة فرعية
            </Badge>
          )}
        </h3>
        {hasDependencies && (
          <button 
            onClick={onShowDependencies}
            className="p-1 ml-2 rounded-full hover:bg-gray-100"
            title="عرض اعتماديات المهمة"
          >
            <Link2 className={`h-4 w-4 ${dependencyIconColor}`} />
          </button>
        )}
      </div>
      
      <div className="flex items-center">
        <div className={`px-2 py-1 rounded-full text-xs font-medium 
          ${status === 'completed' ? 'bg-green-100 text-green-700' : 
            status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 
            status === 'delayed' ? 'bg-red-100 text-red-700' : 
            'bg-blue-100 text-blue-700'}`}
        >
          {status === 'completed' ? 'مكتملة' : 
            status === 'in_progress' ? 'قيد التنفيذ' : 
            status === 'delayed' ? 'متأخرة' : 'قيد الانتظار'}
        </div>
      </div>
    </div>
  );
};
