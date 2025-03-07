
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Workspace } from "@/types/workspace";
import { useState } from "react";
import { WorkspaceMembersDialog } from "./WorkspaceMembersDialog";
import { EditWorkspaceDialog } from "./EditWorkspaceDialog";
import { DeleteWorkspaceDialog } from "./DeleteWorkspaceDialog";
import { useAuthStore } from "@/store/refactored-auth";
import { WorkspaceCardHeader } from "./workspace-card/WorkspaceCardHeader";
import { ProjectStats } from "./workspace-card/ProjectStats";
import { WorkspaceCardFooter } from "./workspace-card/WorkspaceCardFooter";
import { useWorkspacePermissions } from "./workspace-card/useWorkspacePermissions";
import { useProjectCounts } from "./workspace-card/useProjectCounts";
import { useMembersCount } from "./workspace-card/useMembersCount";

interface WorkspaceCardProps {
  workspace: Workspace;
}

export const WorkspaceCard = ({ workspace }: WorkspaceCardProps) => {
  const navigate = useNavigate();
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { user } = useAuthStore();
  
  const { canEdit, isLoading: isPermissionsLoading } = useWorkspacePermissions(workspace, user);
  const projectCounts = useProjectCounts(workspace.id);
  const membersCount = useMembersCount(workspace.id, isMembersDialogOpen);

  const handleClick = () => {
    navigate(`/tasks/workspace/${workspace.id}`);
  };

  const handleManageMembers = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMembersDialogOpen(true);
  };

  const onMembersDialogClose = (open: boolean) => {
    setIsMembersDialogOpen(open);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditDialogOpen(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <Card 
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleClick}
      >
        <CardContent className="p-6">
          <WorkspaceCardHeader
            name={workspace.name}
            description={workspace.description}
            canEdit={canEdit}
            isLoading={isPermissionsLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          
          <ProjectStats projectCounts={projectCounts} />
        </CardContent>
        
        <CardFooter>
          <WorkspaceCardFooter
            membersCount={membersCount}
            onManageMembers={handleManageMembers}
          />
        </CardFooter>
      </Card>

      <WorkspaceMembersDialog 
        open={isMembersDialogOpen}
        onOpenChange={onMembersDialogClose}
        workspaceId={workspace.id}
      />

      <EditWorkspaceDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        workspace={workspace}
      />

      <DeleteWorkspaceDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        workspaceId={workspace.id}
        workspaceName={workspace.name}
      />
    </>
  );
};
