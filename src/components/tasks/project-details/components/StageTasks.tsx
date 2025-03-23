
import React from "react";
import { Task } from "../types/task";
import { StageType } from "../types/stage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectTaskItem } from "./ProjectTaskItem";

interface StageTasksProps {
  stage: StageType;
  tasks: Task[];
  getStatusBadge: (status: string) => React.ReactElement;
  getPriorityBadge: (priority: string | null) => React.ReactElement | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, status: string) => Promise<void>;
  projectId?: string;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => Promise<void>;
  customRenderTaskActions?: (task: Task) => React.ReactNode;
}

export const StageTasks: React.FC<StageTasksProps> = ({ 
  stage, 
  tasks,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  projectId,
  onEditTask,
  onDeleteTask,
  customRenderTaskActions
}) => {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <Card className="border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{stage.name}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {tasks.map((task) => (
            <ProjectTaskItem
              key={task.id}
              task={task}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
              formatDate={formatDate}
              onStatusChange={onStatusChange}
              projectId={projectId}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              customRenderTaskActions={customRenderTaskActions}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
