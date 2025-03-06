
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { ProjectTasksEmptyState } from "./TasksEmptyState";
import { ProjectTasksLoadingState } from "./TasksLoadingState";
import { Task } from "../types/task";
import { TaskItem } from "./TaskItem";
import { TasksStageGroup } from "./TasksStageGroup";

interface TasksContentProps {
  isLoading: boolean;
  activeTab: string;
  filteredTasks: Task[];
  projectStages: string[];
  tasksByStage: Record<string, Task[]>;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId?: string;
  onTaskDeleted?: () => void;
  onTaskEdit?: (taskId: string) => void;
}

export const TasksContent = ({
  isLoading,
  activeTab,
  filteredTasks,
  projectStages,
  tasksByStage,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  projectId = "",
  onTaskDeleted,
  onTaskEdit
}: TasksContentProps) => {
  
  if (isLoading) {
    return <ProjectTasksLoadingState />;
  }
  
  if (activeTab === "by_stage") {
    return (
      <div className="space-y-6 mt-4">
        {projectStages.map(stage => (
          <TasksStageGroup
            key={stage}
            stage={stage}
            tasks={tasksByStage[stage] || []}
            getStatusBadge={getStatusBadge}
            getPriorityBadge={getPriorityBadge}
            formatDate={formatDate}
            onStatusChange={onStatusChange}
            projectId={projectId}
            onTaskDeleted={onTaskDeleted}
            onTaskEdit={onTaskEdit}
          />
        ))}
      </div>
    );
  }
  
  if (filteredTasks.length === 0) {
    return <ProjectTasksEmptyState />;
  }
  
  return (
    <div className="rounded-md border mt-4 overflow-hidden">
      <Table dir="rtl">
        <TableHeader>
          <TableRow>
            <TableHead>المهمة</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>الأولوية</TableHead>
            <TableHead>المكلف</TableHead>
            <TableHead>تاريخ الاستحقاق</TableHead>
            <TableHead className="text-left">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTasks.map(task => (
            <TaskItem 
              key={task.id}
              task={task}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
              formatDate={formatDate}
              onStatusChange={onStatusChange}
              projectId={projectId}
              onTaskDeleted={onTaskDeleted}
              onTaskEdit={onTaskEdit}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
