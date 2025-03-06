
import { Skeleton } from "@/components/ui/skeleton";
import { Task } from "../types/task";
import { ProjectStagesTasks } from "./ProjectStagesTasks";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react"; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TasksWithVisibility } from "./TasksWithVisibility";
import { Progress } from "@/components/ui/progress";

interface TasksContentProps {
  isLoading: boolean;
  activeTab: string;
  filteredTasks: Task[];
  projectStages: any[];
  tasksByStage: Record<string, Task[]>;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId?: string;
  isGeneral?: boolean;
  isDraftProject?: boolean;
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
  projectId,
  isGeneral = false,
  isDraftProject = false
}: TasksContentProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4 mt-4">
        <div className="p-4 border rounded-md">
          <div className="mb-4">
            <Skeleton className="h-4 w-40 mb-2" />
            <Progress value={25} className="h-2" />
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full mt-2" />
          <Skeleton className="h-12 w-full mt-2" />
        </div>
      </div>
    );
  }

  if (activeTab === "stages" && projectStages.length > 0) {
    return (
      <ProjectStagesTasks
        projectStages={projectStages}
        tasksByStage={tasksByStage}
        getStatusBadge={getStatusBadge}
        getPriorityBadge={getPriorityBadge}
        formatDate={formatDate}
        onStatusChange={onStatusChange}
        projectId={projectId}
      />
    );
  }

  return (
    <div className="mt-4">
      <TasksWithVisibility
        tasks={filteredTasks}
        viewMode="table"
        getStatusBadge={getStatusBadge}
        getPriorityBadge={getPriorityBadge}
        formatDate={formatDate}
        onStatusChange={onStatusChange}
        projectId={projectId}
        isDraftProject={isDraftProject}
        isLoading={isLoading}
      />
    </div>
  );
};
