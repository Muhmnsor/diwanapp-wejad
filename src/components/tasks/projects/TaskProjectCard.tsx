
import { Card, CardContent } from "@/components/ui/card";
import { TaskProjectCardBadge } from "./card/TaskProjectCardBadge";
import { TaskProjectCardProgress } from "./card/TaskProjectCardProgress";
import { TaskProjectCardFooter } from "./card/TaskProjectCardFooter";
import { TaskProjectCardActions } from "./card/TaskProjectCardActions";
import { useTaskProjectCard } from "./hooks/useTaskProjectCard";
import { EditTaskProjectDialog } from "./EditTaskProjectDialog";
import { DeleteTaskProjectDialog } from "./DeleteTaskProjectDialog";

interface TaskProject {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  workspace_id: string;
  project_id: string | null;
}

interface TaskProjectCardProps {
  project: TaskProject;
  onProjectUpdated?: () => void;
}

export const TaskProjectCard = ({ project, onProjectUpdated }: TaskProjectCardProps) => {
  const {
    completedTasksCount,
    totalTasksCount,
    overdueTasksCount,
    completionPercentage,
    projectOwner,
    isEditDialogOpen,
    isDeleteDialogOpen,
    handleClick,
    handleEditClick,
    handleDeleteClick,
    handleProjectUpdated,
    handleProjectDeleted,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen
  } = useTaskProjectCard(project, onProjectUpdated);

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer relative"
      onClick={handleClick}
    >
      <TaskProjectCardActions
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />
      
      <CardContent className="p-6">
        <div className="mb-3 flex justify-between items-start">
          <h3 className="font-bold text-lg">{project.title}</h3>
          <TaskProjectCardBadge status={project.status} />
        </div>
        
        <p className="text-gray-500 mb-4 text-sm line-clamp-2">
          {project.description || 'لا يوجد وصف'}
        </p>

        <TaskProjectCardProgress
          completionPercentage={completionPercentage}
          completedTasksCount={completedTasksCount}
          overdueTasksCount={overdueTasksCount}
          totalTasksCount={totalTasksCount}
        />
      </CardContent>
      
      <TaskProjectCardFooter
        dueDate={project.due_date}
        projectOwner={projectOwner}
      />

      <EditTaskProjectDialog 
        isOpen={isEditDialogOpen} 
        onClose={() => setIsEditDialogOpen(false)} 
        project={project}
        onSuccess={handleProjectUpdated}
      />

      <DeleteTaskProjectDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        projectId={project.id}
        projectTitle={project.title}
        onSuccess={handleProjectDeleted}
      />
    </Card>
  );
};
