
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserFormFields } from "../UserFormFields";
import { Role } from "../types";
import { useCreateUserForm } from "../hooks/useCreateUserForm";

interface ControlledCreateUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onUserCreated?: () => void;
  roles: Role[];
}

export const ControlledCreateUserDialog = ({
  isOpen,
  onClose,
  onSuccess,
  onUserCreated,
  roles,
}: ControlledCreateUserDialogProps) => {
  const { formState, handlers } = useCreateUserForm({
    onSuccess,
    onUserCreated,
    onClose,
  });

  return (
    <Dialog open={isOpen} onOpenChange={handlers.onDialogClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right">إضافة مستخدم جديد</DialogTitle>
          <DialogDescription className="text-right">
            أدخل معلومات المستخدم الجديد. سيتمكن المستخدم من تسجيل الدخول باستخدام البريد الإلكتروني وكلمة المرور.
          </DialogDescription>
        </DialogHeader>
        
        <UserFormFields
          newUsername={formState.newUsername}
          setNewUsername={formState.setNewUsername}
          newPassword={formState.newPassword}
          setNewPassword={formState.setNewPassword}
          selectedRole={formState.selectedRole}
          setSelectedRole={formState.setSelectedRole}
          roles={roles}
          newDisplayName={formState.newDisplayName}
          setNewDisplayName={formState.setNewDisplayName}
        />
        
        <DialogFooter className="flex flex-row-reverse sm:justify-start gap-2">
          <Button 
            onClick={handlers.handleCreateUser}
            disabled={formState.isSubmitting}
          >
            {formState.isSubmitting ? "جارِ الإنشاء..." : "إنشاء المستخدم"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handlers.onDialogClose}
            disabled={formState.isSubmitting}
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
