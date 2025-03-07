
import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Workspace } from "@/types/workspace";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "@/store/refactored-auth/types";

export interface WorkspaceFormData {
  name: string;
  description: string;
}

export const useWorkspaceForm = (
  workspace: Workspace,
  user: User | null,
  onClose: () => void,
  canEdit: boolean
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<WorkspaceFormData>({
    defaultValues: {
      name: workspace.name,
      description: workspace.description || "",
    }
  });

  // Reset form with workspace data
  const resetForm = () => {
    reset({
      name: workspace.name,
      description: workspace.description || "",
    });
    setError(null);
  };

  const onSubmit = async (data: WorkspaceFormData) => {
    if (!user) {
      console.error("[EditWorkspace] Operation failed: No authenticated user");
      toast.error("يجب تسجيل الدخول للقيام بهذه العملية");
      return;
    }

    if (!canEdit) {
      console.error("[EditWorkspace] User lacks permission to edit workspace");
      setError("ليس لديك صلاحية تعديل مساحة العمل");
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
      onClose();
    } catch (error) {
      console.error("[EditWorkspace] Unexpected error during update:", error);
      console.error("[EditWorkspace] Error details:", JSON.stringify(error));
      setError(error instanceof Error ? error.message : "حدث خطأ أثناء تحديث مساحة العمل");
      toast.error("حدث خطأ أثناء تحديث مساحة العمل");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    error,
    onSubmit,
    resetForm
  };
};
