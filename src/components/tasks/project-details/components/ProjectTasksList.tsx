
import { useState, useEffect } from "react";
import { Task } from "../../types/task";
import { ProjectStagesTabs } from "./stages/ProjectStagesTabs";

interface ProjectTasksListProps {
  projectId?: string;
  tasks: Task[];
  stages: { id: string; name: string }[];
  onStatusChange: (taskId: string, newStatus: string) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onEditTask: (task: Task) => void;
}

export const ProjectTasksList = ({
  projectId = "",
  tasks,
  stages,
  onStatusChange,
  onDeleteTask,
  onEditTask
}: ProjectTasksListProps) => {
  // Handle tasks that have no stage assigned
  const [unstageTasks, setUnstageTasks] = useState<Task[]>([]);
  
  useEffect(() => {
    // Filter tasks with no stage assigned
    const tasksWithoutStage = tasks.filter(task => !task.stage_id);
    setUnstageTasks(tasksWithoutStage);
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* Render tasks organized by stages */}
      {stages.length > 0 && (
        <ProjectStagesTabs
          projectId={projectId}
          stages={stages}
          tasks={tasks}
          onStatusChange={onStatusChange}
          onDeleteTask={onDeleteTask}
          onEditTask={onEditTask}
        />
      )}
      
      {/* Render tasks without stages */}
      {unstageTasks.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium text-lg mb-4">مهام غير مصنفة</h3>
          <div className="space-y-4">
            {unstageTasks.map(task => (
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
          </div>
        </div>
      )}
      
      {/* Show a message if there are no tasks */}
      {tasks.length === 0 && (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-gray-500">لا توجد مهام في هذا المشروع</p>
        </div>
      )}
    </div>
  );
};
