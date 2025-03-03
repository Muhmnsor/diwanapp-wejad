
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProjectStages } from "./ProjectStages";
import { AddTaskDialog } from "./AddTaskDialog";
import { TasksHeader } from "./components/TasksHeader";
import { TasksFilter } from "./components/TasksFilter";
import { TasksContent } from "./components/TasksContent";
import { getStatusBadge, getPriorityBadge, formatDate } from "./utils/taskFormatters";
import { useTasksList } from "./hooks/useTasksList";
import { Task } from "./types/task";

interface TasksListProps {
  projectId: string | undefined;
}

// Re-export Task interface for backward compatibility
export type { Task };

export const TasksList = ({ projectId }: TasksListProps) => {
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
    fetchTasks
  } = useTasksList(projectId);

  const filteredTasks = tasks.filter(task => {
    if (activeTab === "all") return true;
    return task.status === activeTab;
  });

  return (
    <>
      <ProjectStages 
        projectId={projectId} 
        onStagesChange={handleStagesChange} 
      />
      
      <Card className="border shadow-sm">
        <CardHeader className="pb-0">
          <TasksHeader onAddTask={() => setIsAddDialogOpen(true)} />
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
          />
        </CardContent>
      </Card>
      
      <AddTaskDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        projectId={projectId}
        projectStages={projectStages}
        onSuccess={fetchTasks}
      />
    </>
  );
};
