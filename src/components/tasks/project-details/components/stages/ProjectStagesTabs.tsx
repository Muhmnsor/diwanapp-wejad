
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Task } from "../../../types/task";

interface ProjectStagesTabsProps {
  projectId: string;
  stages: { id: string; name: string }[];
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: string) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onEditTask: (task: Task) => void;
}

export const ProjectStagesTabs = ({
  projectId,
  stages,
  tasks,
  onStatusChange,
  onDeleteTask,
  onEditTask
}: ProjectStagesTabsProps) => {
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [stageTasks, setStageTasks] = useState<Record<string, Task[]>>({});

  // Set initial active stage
  useEffect(() => {
    if (stages.length > 0 && !activeStage) {
      setActiveStage(stages[0].id);
    }
  }, [stages, activeStage]);

  // Group tasks by stage
  useEffect(() => {
    const tasksByStage: Record<string, Task[]> = {};
    
    // Initialize with empty arrays for all stages
    stages.forEach(stage => {
      tasksByStage[stage.id] = [];
    });
    
    // Group tasks by their stage
    tasks.forEach(task => {
      if (task.stage_id && tasksByStage[task.stage_id]) {
        tasksByStage[task.stage_id].push(task);
      }
    });
    
    setStageTasks(tasksByStage);
  }, [tasks, stages]);

  return (
    <div className="space-y-4">
      <Tabs value={activeStage || undefined} onValueChange={setActiveStage}>
        <TabsList className="w-full mb-4">
          {stages.map((stage) => (
            <TabsTrigger key={stage.id} value={stage.id} className="flex-1">
              {stage.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {activeStage && stageTasks[activeStage] && (
          <div className="space-y-4">
            {stageTasks[activeStage].map((task) => (
              <div key={task.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
                <h3 className="font-medium text-lg">{task.title}</h3>
                {task.description && (
                  <p className="text-gray-600 mt-1">{task.description}</p>
                )}
                <div className="flex justify-end gap-2 mt-4">
                  <button 
                    className="text-blue-600 text-sm"
                    onClick={() => onEditTask(task)}
                  >
                    تعديل
                  </button>
                  <button 
                    className="text-red-600 text-sm"
                    onClick={() => onDeleteTask(task.id)}
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
            
            {stageTasks[activeStage].length === 0 && (
              <div className="text-center p-8 text-gray-500">
                لا توجد مهام في هذه المرحلة
              </div>
            )}
          </div>
        )}
      </Tabs>
    </div>
  );
};
