
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWorkspaceMembers } from "./workspace-members/useWorkspaceMembers";
import { AddMemberForm } from "./workspace-members/AddMemberForm";
import { MembersList } from "./workspace-members/MembersList";

interface WorkspaceMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
}

export const WorkspaceMembersDialog = ({ open, onOpenChange, workspaceId }: WorkspaceMembersDialogProps) => {
  const { members, users, isMembersLoading, isUsersLoading } = useWorkspaceMembers(workspaceId, open);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إدارة أعضاء مساحة العمل</DialogTitle>
        </DialogHeader>
        
        <AddMemberForm 
          workspaceId={workspaceId}
          members={members}
          users={users}
          isUsersLoading={isUsersLoading}
        />
        
        <div className="mt-6">
          <h3 className="font-bold mb-2">الأعضاء الحاليين</h3>
          <MembersList 
            members={members}
            isLoading={isMembersLoading}
            workspaceId={workspaceId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
