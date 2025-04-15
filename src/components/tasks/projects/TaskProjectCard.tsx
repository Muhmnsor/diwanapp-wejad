import { Card, CardContent } from "@/components/ui/card";
import { TaskProjectCardBadge } from "./card/TaskProjectCardBadge";
import { TaskProjectCardProgress } from "./card/TaskProjectCardProgress";
import { TaskProjectCardFooter } from "./card/TaskProjectCardFooter";
import { TaskProjectCardActions } from "./card/TaskProjectCardActions";
import { useTaskProjectCard } from "./hooks/useTaskProjectCard";
import { EditTaskProjectDialog } from "./EditTaskProjectDialog";
import { DeleteTaskProjectDialog } from "./DeleteTaskProjectDialog";
import { CopyTaskProjectDialog } from "./CopyTaskProjectDialog";

interface TaskProject {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  workspace_id: string;
  project_id: string | null;
  project_manager?: string | null;
  project_manager_name?: string | null;
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
    handleClick,
    handleEditClick,
    handleDeleteClick,
    handleCopyClick,
    handleProjectUpdated,
    handleProjectDeleted,
    handleProjectCopied,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsCopyDialogOpen
  } = useTaskProjectCard(project, onProjectUpdated);

  const isDraft = project.is_draft || false;

  return (
    <Card 
      className={`hover:shadow-md transition-shadow cursor-pointer relative group ${isDraft ? 'bg-gray-50/50 border-gray-300' : ''}`}
      onClick={handleClick}
    >
<TaskProjectCardActions
  onEdit={handleEditClick}
  onDelete={handleDeleteClick}
  onCopy={handleCopyClick}
  workspaceId={project.workspace_id}
  projectId={project.id}
/>
      
      <CardContent className="p-6">
        <div className="mb-3 flex justify-between items-start">
          <h3 className="font-bold text-lg flex items-center gap-2">
            {project.title}
            {isDraft && (
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">مسودة</span>
            )}
          </h3>
          <TaskProjectCardBadge status={project.status} isDraft={isDraft} />
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
        isDraft={isDraft}
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
        isDraft={isDraft}
      />

      <CopyTaskProjectDialog
        isOpen={isCopyDialogOpen}
        onClose={() => setIsCopyDialogOpen(false)}
        project={project}
        onSuccess={handleProjectCopied}
      />
    </Card>
  );
};
