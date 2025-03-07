
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
        // Get project details to verify ownership/permissions
        const { data: projectData, error: projectFetchError } = await supabase
          .from("project_tasks")
          .select("project_manager")
          .eq("id", projectId)
          .single();
        
        if (projectFetchError) {
          console.error("Error fetching project data:", projectFetchError);
          throw new Error("لا يمكن التحقق من صلاحيات الحذف");
        }
        
        // Verify user has permission to delete (is creator or admin)
        const isProjectCreator = projectData?.project_manager === user?.id;
        const isAdmin = user?.isAdmin || false;
        
        if (!isProjectCreator && !isAdmin) {
          console.error("User does not have permission to delete this project");
          throw new Error("ليس لديك صلاحية حذف هذا المشروع");
        }

        // Handle deletion of non-draft projects in a sequential way
        console.log("Deleting non-draft project with sequential deletions");
        
        // Get task IDs for this project
        const { data: tasks, error: tasksError } = await supabase
          .from("tasks")
          .select("id")
          .eq("project_id", projectId);
        
        if (tasksError) {
          console.error("Error fetching tasks:", tasksError);
          throw new Error("فشل في الحصول على المهام المرتبطة بالمشروع");
        }
        
        const taskIds = tasks ? tasks.map(task => task.id) : [];
        console.log(`Found ${taskIds.length} tasks to delete`);
        
        if (taskIds.length > 0) {
          // 1. Delete task discussion attachments
          const { error: discussionAttachmentsError } = await supabase
            .from("task_discussion_attachments")
            .delete()
            .in("task_id", taskIds);
          
          if (discussionAttachmentsError) {
            console.error("Error deleting discussion attachments:", discussionAttachmentsError);
            // Continue despite error
          }
          
          // 2. Delete task comments
          const { error: commentsError } = await supabase
            .from("task_comments")
            .delete()
            .in("task_id", taskIds);
          
          if (commentsError) {
            console.error("Error deleting comments:", commentsError);
            // Continue despite error
          }
          
          // 3. Delete unified comments
          const { error: unifiedCommentsError } = await supabase
            .from("unified_task_comments")
            .delete()
            .eq("task_table", "tasks")
            .in("task_id", taskIds);
          
          if (unifiedCommentsError) {
            console.error("Error deleting unified comments:", unifiedCommentsError);
            // Continue despite error
          }
          
          // 4. Delete task attachments
          const { error: attachmentsError } = await supabase
            .from("task_attachments")
            .delete()
            .in("task_id", taskIds);
          
          if (attachmentsError) {
            console.error("Error deleting attachments:", attachmentsError);
            // Continue despite error
          }
          
          // 5. Delete subtasks
          const { error: subtasksError } = await supabase
            .from("subtasks")
            .delete()
            .in("task_id", taskIds);
          
          if (subtasksError) {
            console.error("Error deleting subtasks:", subtasksError);
            // Continue despite error
          }
          
          // 6. Delete tasks
          const { error: deleteTasksError } = await supabase
            .from("tasks")
            .delete()
            .eq("project_id", projectId);
          
          if (deleteTasksError) {
            console.error("Error deleting tasks:", deleteTasksError);
            throw new Error("فشل في حذف المهام المرتبطة بالمشروع");
          }
        }
        
        // 7. Delete project stages
        const { error: stagesError } = await supabase
          .from("project_stages")
          .delete()
          .eq("project_id", projectId);
        
        if (stagesError) {
          console.error("Error deleting project stages:", stagesError);
          // Continue despite error
        }
        
        // 8. Finally delete the project
        const { error: deleteProjectError } = await supabase
          .from("project_tasks")
          .delete()
          .eq("id", projectId);
        
        if (deleteProjectError) {
          console.error("Error deleting project:", deleteProjectError);
          throw new Error("فشل في حذف المشروع");
        }
        
        console.log("Project successfully deleted");
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
