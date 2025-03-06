
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProjectStages } from "./ProjectStages";
import { AddTaskDialog } from "./AddTaskDialog";
import { TasksHeader } from "./components/TasksHeader";
import { TasksFilter } from "./components/TasksFilter";
import { TasksContent } from "./components/TasksContent";
import { getStatusBadge, getPriorityBadge, formatDate } from "./utils/taskFormatters";
import { useTasksList } from "./hooks/useTasksList";
import { Task } from "./types/task";
import { useProjectMembers } from "./hooks/useProjectMembers";
import { useProjectPermissions } from "@/hooks/useProjectPermissions";

interface TasksListProps {
  projectId?: string | undefined;
  isDraftProject?: boolean;
}

// Re-export Task interface for backward compatibility
export type { Task };

export const TasksList = ({ projectId, isDraftProject = false }: TasksListProps) => {
  const {
    tasks,
    isLoading,
    activeTab,
    setActiveTab,
    isAddDialogOpen,
    setIsAddDialogOpen,
    projectStages,
    handleStagesChange,
    tasksByStage,
    handleStatusChange,
    fetchTasks,
    isGeneral
  } = useTasksList(projectId);
  
  // Get project permissions
  const { isDraftProject: isDraft } = useProjectPermissions(projectId);

  // Use either the prop or the hook result (prefer hook as it's real-time)
  const isProjectDraft = isDraft || isDraftProject;

  // Fetch project members
  const { projectMembers } = useProjectMembers(projectId);

  const filteredTasks = tasks.filter(task => {
    if (activeTab === "all") return true;
    return task.status === activeTab;
  });

  return (
    <>
      {!isGeneral && (
        <ProjectStages 
          projectId={projectId} 
          onStagesChange={handleStagesChange} 
        />
      )}
      
      <Card className="border shadow-sm">
        <CardHeader className="pb-0">
          <TasksHeader onAddTask={() => setIsAddDialogOpen(true)} isGeneral={isGeneral} />
        </CardHeader>
        
        <CardContent className="pt-4">
          <TasksFilter 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
          
          <TasksContent 
            isLoading={isLoading}
            activeTab={activeTab}
            filteredTasks={filteredTasks}
            projectStages={projectStages}
            tasksByStage={tasksByStage}
            getStatusBadge={getStatusBadge}
            getPriorityBadge={getPriorityBadge}
            formatDate={formatDate}
            onStatusChange={handleStatusChange}
            projectId={projectId}
            isGeneral={isGeneral}
            isDraftProject={isProjectDraft}
          />
        </CardContent>
      </Card>
      
      <AddTaskDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        projectId={projectId || ""}
        projectStages={projectStages}
        onTaskAdded={fetchTasks}
        projectMembers={projectMembers}
        isGeneral={isGeneral}
        isDraftProject={isProjectDraft}
      />
    </>
  );
};
