
import { useEffect } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Workspace } from "@/types/workspace";
import { useAuthStore } from "@/store/refactored-auth";
import { useWorkspacePermissions } from "./workspace-card/useWorkspacePermissions";
import { WorkspaceForm } from "./workspace-form/WorkspaceForm";

interface EditWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: Workspace;
}

export const EditWorkspaceDialog = ({
  open,
  onOpenChange,
  workspace,
}: EditWorkspaceDialogProps) => {
  const { user } = useAuthStore();
  const { canEdit, isLoading: permissionsLoading } = useWorkspacePermissions(workspace, user);
  
  // Log when dialog opens
  useEffect(() => {
    if (open) {
      console.log("[EditWorkspace] Opened edit dialog for workspace:", workspace.id);
    }
  }, [open, workspace.id]);

  const handleClose = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل مساحة العمل</DialogTitle>
          <DialogDescription>
            قم بتحديث بيانات مساحة العمل
          </DialogDescription>
        </DialogHeader>
        
        <WorkspaceForm
          workspace={workspace}
          user={user}
          onClose={handleClose}
          canEdit={canEdit}
          isPermissionsLoading={permissionsLoading}
        />
      </DialogContent>
    </Dialog>
  );
};
