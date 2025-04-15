import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ProjectHeader } from "./components/ProjectHeader";
import { ProjectTasksList } from "./components/ProjectTasksList";
import { useProjectDetails } from "./hooks/useProjectDetails";
import { useProjectMembers } from "./hooks/useProjectMembers";
import { useProjectStages } from "./hooks/useProjectStages";
import { useWorkspacePermissions } from "@/hooks/tasks/useWorkspacePermissions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";

export const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [stages, setStages] = useState<{ id: string; name: string }[]>([]);

  const { project, isLoading: isProjectLoading } = useProjectDetails(projectId);
  const { projectMembers, isLoading: isProjectMembersLoading } = useProjectMembers(projectId);
  const { isLoading: isStagesLoading, canViewStages } = useProjectStages({
    projectId,
    onStagesChange: setStages
  });

  if (isProjectLoading || isProjectMembersLoading || isStagesLoading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="animate-pulse rounded-lg bg-muted h-96 w-full max-w-4xl"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-8 text-center">
        <h2 className="text-xl font-bold">المشروع غير موجود</h2>
        <p className="text-muted-foreground">لم يتم العثور على المشروع المطلوب</p>
      </div>
    );
  }

  const { canDelete } = useWorkspacePermissions(project.workspace_id, projectId || "");

  const handleEdit = () => {
    navigate(`/tasks/projects/${projectId}/edit`);
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      navigate('/tasks/projects');
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  return (
    <div className="space-y-6">
      <ProjectHeader
        project={project}
        onEdit={canDelete ? handleEdit : undefined}
        onDelete={canDelete ? handleDelete : undefined}
      />

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="tasks" className="flex-1">المهام</TabsTrigger>
          {/* يمكن إضافة تبويبات إضافية هنا */}
        </TabsList>

        <TabsContent value="tasks">
          <ProjectTasksList
            projectId={projectId}
            stages={stages}
            projectMembers={projectMembers}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
