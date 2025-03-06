
import { Task } from "../types/task";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TasksWithVisibility } from "./TasksWithVisibility";

interface ProjectStagesTasksProps {
  projectStages: any[];
  tasksByStage: Record<string, Task[]>;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId?: string;
}

export const ProjectStagesTasks = ({
  projectStages,
  tasksByStage,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  projectId
}: ProjectStagesTasksProps) => {
  return (
    <div className="space-y-8">
      {projectStages.map((stage) => {
        const stageTasks = tasksByStage[stage.id] || [];
        
        return (
          <Card key={stage.id} className="border-t-4" style={{ borderTopColor: stage.color || '#cbd5e1' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{stage.name}</span>
                <span className="text-sm text-muted-foreground">{stageTasks.length} مهمة</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stageTasks.length > 0 ? (
                <TasksWithVisibility
                  tasks={stageTasks}
                  viewMode="list"
                  getStatusBadge={getStatusBadge}
                  getPriorityBadge={getPriorityBadge}
                  formatDate={formatDate}
                  onStatusChange={onStatusChange}
                  projectId={projectId}
                />
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">لا توجد مهام في هذه المرحلة</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
