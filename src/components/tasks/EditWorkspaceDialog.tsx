
import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Workspace } from "@/types/workspace";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/store/refactored-auth";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useWorkspacePermissions } from "./workspace-card/useWorkspacePermissions";

interface EditWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: Workspace;
}

interface WorkspaceFormData {
  name: string;
  description: string;
}

export const EditWorkspaceDialog = ({
  open,
  onOpenChange,
  workspace,
}: EditWorkspaceDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { canEdit, isLoading: permissionsLoading } = useWorkspacePermissions(workspace, user);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<WorkspaceFormData>({
    defaultValues: {
      name: workspace.name,
      description: workspace.description || "",
    }
  });

  // Reset form when workspace data changes
  useEffect(() => {
    if (open) {
      console.log("[EditWorkspace] Opened edit dialog for workspace:", workspace.id);
      reset({
        name: workspace.name,
        description: workspace.description || "",
      });
      setError(null);
    }
  }, [open, reset, workspace]);

  const onSubmit = async (data: WorkspaceFormData) => {
    if (!user) {
      console.error("[EditWorkspace] Operation failed: No authenticated user");
      toast.error("يجب تسجيل الدخول للقيام بهذه العملية");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    // Add more detailed logging
    console.log("[EditWorkspace] Starting workspace update process");
    console.log("[EditWorkspace] Workspace ID:", workspace.id);
    console.log("[EditWorkspace] User ID:", user.id);
    console.log("[EditWorkspace] Old data:", { name: workspace.name, description: workspace.description });
    console.log("[EditWorkspace] New data:", data);
    
    // Verify user has permission (use the hook results)
    if (!canEdit && !permissionsLoading) {
      console.error("[EditWorkspace] User lacks permission to edit workspace");
      setError("ليس لديك صلاحية تعديل مساحة العمل");
      setIsSubmitting(false);
      return;
    }

    try {
      // Call Supabase to update workspace - only update name and description fields
      console.log("[EditWorkspace] Sending update request to Supabase");
      const { data: updateData, error: updateError } = await supabase
        .from('workspaces')
        .update({
          name: data.name,
          description: data.description,
          // Don't try to update updated_at as it doesn't exist in the table
        })
        .eq('id', workspace.id)
        .select();

      console.log("[EditWorkspace] Update response:", { data: updateData, error: updateError });

      if (updateError) {
        console.error("[EditWorkspace] Error updating workspace:", updateError);
        console.error("[EditWorkspace] Error details:", JSON.stringify(updateError));
        setError(updateError.message || "حدث خطأ أثناء تحديث مساحة العمل");
        setIsSubmitting(false);
        return;
      }

      // Invalidate the workspaces query to refresh the list
      console.log("[EditWorkspace] Update successful, invalidating queries");
      queryClient.invalidateQueries({queryKey: ['workspaces']});
      
      toast.success("تم تحديث مساحة العمل بنجاح");
      console.log("[EditWorkspace] Workspace updated successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("[EditWorkspace] Unexpected error during update:", error);
      console.error("[EditWorkspace] Error details:", JSON.stringify(error));
      setError(error instanceof Error ? error.message : "حدث خطأ أثناء تحديث مساحة العمل");
      toast.error("حدث خطأ أثناء تحديث مساحة العمل");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل مساحة العمل</DialogTitle>
          <DialogDescription>
            قم بتحديث بيانات مساحة العمل
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">اسم مساحة العمل</Label>
            <Input
              id="name"
              {...register("name", { required: "اسم مساحة العمل مطلوب" })}
              disabled={permissionsLoading || !canEdit}
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
              disabled={permissionsLoading || !canEdit}
            />
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {permissionsLoading && (
            <p className="text-sm text-muted-foreground">جاري التحقق من الصلاحيات...</p>
          )}
          
          {!permissionsLoading && !canEdit && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>ليس لديك صلاحية لتعديل مساحة العمل</AlertDescription>
            </Alert>
          )}
          
          <DialogFooter className="flex-row-reverse sm:justify-start gap-2 mt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting || permissionsLoading || !canEdit}
            >
              {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
