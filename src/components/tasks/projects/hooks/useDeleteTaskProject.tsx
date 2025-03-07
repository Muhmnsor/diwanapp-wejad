
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthStore } from "@/store/refactored-auth";

interface UseDeleteTaskProjectProps {
  projectId: string;
  isDraft?: boolean;
  onSuccess?: () => void;
  onClose: () => void;
}

export const useDeleteTaskProject = ({
  projectId,
  isDraft = false,
  onSuccess,
  onClose
}: UseDeleteTaskProjectProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuthStore();

  const handleDelete = async () => {
    if (!user) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }
    
    setIsDeleting(true);
    
    try {
      console.log("Deleting project:", projectId, "Is draft:", isDraft, "Current user:", user?.id);
      
      if (isDraft) {
        // For draft projects, use the Edge Function
        console.log("Using Edge Function for draft project deletion");
        
        const response = await supabase.functions.invoke('delete-draft-project', {
          body: { 
            projectId, 
            userId: user.id 
          }
        });
        
        console.log("Edge function response:", response);
        
        if (response.error) {
          console.error("Edge function error:", response.error);
          throw new Error(response.error.message || "فشل في حذف المشروع");
        }
        
        if (!response.data?.success) {
          console.error("Edge function unsuccessful:", response.data);
          throw new Error(response.data?.error || "فشل في حذف المشروع");
        }
      } else {
        // For non-draft projects, use the new database function
        console.log("Using database function for project deletion");
        
        const { data, error } = await supabase.rpc('delete_project', {
          p_project_id: projectId,
          p_user_id: user.id
        });
        
        if (error) {
          console.error("Error deleting project:", error);
          throw new Error(error.message || "فشل في حذف المشروع");
        }
        
        if (!data) {
          console.error("Project deletion failed");
          throw new Error("فشل في حذف المشروع");
        }
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
      toast.success("تم حذف المشروع بنجاح");
      onClose();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء حذف المشروع");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    handleDelete
  };
};
