
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Task } from "../types/task";

interface TaskStageTabsProps {
  projectStages: any[];
  tasksCount: number;
  tasksByStage: Record<string, Task[]>;
  isGeneral?: boolean;
}

export const TaskStageTabs = ({ 
  projectStages, 
  tasksCount, 
  tasksByStage,
  isGeneral = false
}: TaskStageTabsProps) => {
  return (
    <TabsList className="mb-4">
      <TabsTrigger value="all-tasks" className="flex items-center gap-2">
        <span>جميع المهام</span>
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
          {tasksCount}
        </span>
      </TabsTrigger>
      
      {!isGeneral && projectStages.map((stage) => (
        <TabsTrigger 
          key={stage.id} 
          value={`stage-${stage.id}`}
          className="flex items-center gap-2"
        >
          <span>{stage.name}</span>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
            {(tasksByStage[stage.id] || []).length}
          </span>
        </TabsTrigger>
      ))}
    </TabsList>
  );
};
