
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
import { AlertCircle, Loader2 } from "lucide-react";

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
  const [retryCount, setRetryCount] = useState(0);
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
      setError(null);
      setRetryCount(0);
    }
  }, [open, reset, workspace]);

  const onSubmit = async (data: WorkspaceFormData) => {
    if (!user) {
      toast.error("يجب تسجيل الدخول للقيام بهذه العملية");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    console.log("Updating workspace:", workspace.id, "with data:", data, "Attempt:", retryCount + 1);
    
    try {
      // Call Supabase to update workspace
      const { error: updateError, data: updateData } = await supabase
        .from('workspaces')
        .update({
          name: data.name,
          description: data.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', workspace.id)
        .select();

      console.log("Update response:", updateData, updateError);

      if (updateError) {
        console.error("Error updating workspace:", updateError);
        setError(updateError.message || "حدث خطأ أثناء تحديث مساحة العمل");
        setIsSubmitting(false);
        return;
      }

      // Invalidate the workspaces query to refresh the list
      queryClient.invalidateQueries({queryKey: ['workspaces']});
      
      toast.success("تم تحديث مساحة العمل بنجاح");
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating workspace:", error);
      setError("حدث خطأ أثناء تحديث مساحة العمل");
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    handleSubmit(onSubmit)();
  };

  const handleCloseDialog = () => {
    if (!isSubmitting) {
      setError(null);
      setRetryCount(0);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل مساحة العمل</DialogTitle>
          <DialogDescription>
            قم بتحديث بيانات مساحة العمل
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
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
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : error ? (
                "إعادة المحاولة"
              ) : (
                "حفظ التغييرات"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseDialog}
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
