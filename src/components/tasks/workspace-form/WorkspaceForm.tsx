
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";
import { useWorkspaceForm, WorkspaceFormData } from "./useWorkspaceForm";
import { Workspace } from "@/types/workspace";
import { User } from "@/store/refactored-auth/types";

interface WorkspaceFormProps {
  workspace: Workspace;
  user: User | null;
  onClose: () => void;
  canEdit: boolean;
  isPermissionsLoading: boolean;
}

export const WorkspaceForm = ({
  workspace,
  user,
  onClose,
  canEdit,
  isPermissionsLoading
}: WorkspaceFormProps) => {
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    error,
    onSubmit
  } = useWorkspaceForm(workspace, user, onClose, canEdit);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="name">اسم مساحة العمل</Label>
        <Input
          id="name"
          {...register("name", { required: "اسم مساحة العمل مطلوب" })}
          disabled={isPermissionsLoading || !canEdit}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">وصف مساحة العمل</Label>
        <Textarea
          id="description"
          {...register("description")}
          rows={4}
          disabled={isPermissionsLoading || !canEdit}
        />
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isPermissionsLoading && (
        <p className="text-sm text-muted-foreground">جاري التحقق من الصلاحيات...</p>
      )}
      
      {!isPermissionsLoading && !canEdit && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>ليس لديك صلاحية لتعديل مساحة العمل</AlertDescription>
        </Alert>
      )}
      
      <DialogFooter className="flex-row-reverse sm:justify-start gap-2 mt-4">
        <Button 
          type="submit" 
          disabled={isSubmitting || isPermissionsLoading || !canEdit}
        >
          {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          إلغاء
        </Button>
      </DialogFooter>
    </form>
  );
};
