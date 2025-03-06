
import { Card, CardContent } from "@/components/ui/card";
import { TaskProjectCardBadge } from "./card/TaskProjectCardBadge";
import { TaskProjectCardProgress } from "./card/TaskProjectCardProgress";
import { TaskProjectCardFooter } from "./card/TaskProjectCardFooter";
import { TaskProjectCardActions } from "./card/TaskProjectCardActions";
import { useTaskProjectCard } from "./hooks/useTaskProjectCard";
import { EditTaskProjectDialog } from "./EditTaskProjectDialog";
import { DeleteTaskProjectDialog } from "./DeleteTaskProjectDialog";
import { CopyProjectDialog } from "./CopyProjectDialog";
import { LaunchProjectDialog } from "./LaunchProjectDialog";
import { Badge } from "@/components/ui/badge";

interface TaskProject {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  workspace_id: string;
  project_id: string | null;
  is_draft?: boolean;
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
    isCopyDialogOpen,
    isLaunchDialogOpen,
    handleClick,
    handleEditClick,
    handleDeleteClick,
    handleCopyClick,
    handleLaunchClick,
    handleProjectUpdated,
    handleProjectDeleted,
    handleProjectCopied,
    handleProjectLaunched,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsCopyDialogOpen,
    setIsLaunchDialogOpen
  } = useTaskProjectCard(project, onProjectUpdated);

  return (
    <Card 
      className={`hover:shadow-md transition-shadow cursor-pointer relative ${project.is_draft ? 'border-dashed border-2 border-blue-300' : ''}`}
      onClick={handleClick}
    >
      <TaskProjectCardActions
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onCopy={handleCopyClick}
        onLaunch={project.is_draft ? handleLaunchClick : undefined}
        isDraft={project.is_draft}
      />
      
      <CardContent className="p-6">
        <div className="mb-3 flex justify-between items-start">
          <h3 className="font-bold text-lg">{project.title}</h3>
          <div className="flex items-center gap-2">
            {project.is_draft && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                مسودة
              </Badge>
            )}
            <TaskProjectCardBadge status={project.status} />
          </div>
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

      <CopyProjectDialog
        open={isCopyDialogOpen}
        onOpenChange={setIsCopyDialogOpen}
        projectId={project.id}
        projectTitle={project.title}
        onSuccess={handleProjectCopied}
      />

      <LaunchProjectDialog
        open={isLaunchDialogOpen}
        onOpenChange={setIsLaunchDialogOpen}
        projectId={project.id}
        projectTitle={project.title}
        onSuccess={handleProjectLaunched}
      />
    </Card>
  );
};
