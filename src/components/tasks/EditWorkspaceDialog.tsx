
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
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<WorkspaceFormData>({
    defaultValues: {
      name: workspace.name,
      description: workspace.description || "",
    }
  });

  // Reset form when workspace data changes
  useEffect(() => {
    if (open) {
      reset({
        name: workspace.name,
        description: workspace.description || "",
      });
    }
  }, [open, reset, workspace]);

  const onSubmit = async (data: WorkspaceFormData) => {
    if (!user) {
      toast.error("يجب تسجيل الدخول للقيام بهذه العملية");
      return;
    }

    setIsSubmitting(true);
    console.log("Updating workspace:", workspace.id, "with data:", data);
    
    try {
      // Call Supabase to update workspace
      const { error } = await supabase
        .from('workspaces')
        .update({
          name: data.name,
          description: data.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', workspace.id);

      if (error) {
        console.error("Error updating workspace:", error);
        throw error;
      }

      // Invalidate the workspaces query to refresh the list
      queryClient.invalidateQueries({queryKey: ['workspaces']});
      
      toast.success("تم تحديث مساحة العمل بنجاح");
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating workspace:", error);
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
            />
          </div>
          
          <DialogFooter className="flex-row-reverse sm:justify-start gap-2 mt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
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
