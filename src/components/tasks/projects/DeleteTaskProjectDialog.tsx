
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/store/refactored-auth";

interface DeleteTaskProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  onSuccess?: () => void;
  isDraft?: boolean;
}

export const DeleteTaskProjectDialog = ({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  onSuccess,
  isDraft = false,
}: DeleteTaskProjectDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuthStore();

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      console.log("Deleting project:", projectId, "Is draft:", isDraft, "Current user:", user?.id);
      
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
      
      if (!isProjectCreator && !isAdmin && !isDraft) {
        console.error("User does not have permission to delete this project");
        throw new Error("ليس لديك صلاحية حذف هذا المشروع");
      }

      // First check if there are any tasks associated with this project
      const { data: tasks, error: tasksError } = await supabase
        .from("tasks")
        .select("id")
        .eq("project_id", projectId);
      
      if (tasksError) {
        console.error("Error checking tasks:", tasksError);
        throw tasksError;
      }
      
      // If there are tasks, delete them first
      if (tasks && tasks.length > 0) {
        const taskIds = tasks.map(task => task.id);
        
        // Delete any subtasks first
        const { error: subtasksError } = await supabase
          .from("subtasks")
          .delete()
          .in("task_id", taskIds);
        
        if (subtasksError) {
          console.error("Error deleting subtasks:", subtasksError);
          // Continue with task deletion even if subtask deletion failed
        }
        
        // Delete tasks
        const { error: deleteTasksError } = await supabase
          .from("tasks")
          .delete()
          .eq("project_id", projectId);
        
        if (deleteTasksError) {
          console.error("Error deleting tasks:", deleteTasksError);
          throw deleteTasksError;
        }
      }
      
      // Delete project stages
      const { error: stagesError } = await supabase
        .from("project_stages")
        .delete()
        .eq("project_id", projectId);
      
      if (stagesError) {
        console.error("Error deleting project stages:", stagesError);
        // Continue with project deletion even if stage deletion failed
      }
      
      // Finally delete the project with more specific approach
      let deleteProjectError;
      
      if (isDraft) {
        // For draft projects, use a more direct approach that bypasses some RLS
        const { error } = await supabase.rpc('delete_draft_project', { 
          project_id: projectId,
          current_user_id: user?.id
        });
        deleteProjectError = error;
        
        if (error) {
          console.error("Error using RPC to delete draft project:", error);
          
          // Fallback: Try direct deletion
          const { error: directError } = await supabase
            .from("project_tasks")
            .delete()
            .eq("id", projectId)
            .eq("is_draft", true);
            
          deleteProjectError = directError;
          
          if (directError) {
            console.error("Error with fallback direct deletion:", directError);
          } else {
            // The fallback worked
            deleteProjectError = null;
          }
        }
      } else {
        // For regular projects
        const { error } = await supabase
          .from("project_tasks")
          .delete()
          .eq("id", projectId);
        
        deleteProjectError = error;
      }
      
      if (deleteProjectError) {
        console.error("Error deleting project:", deleteProjectError);
        throw deleteProjectError;
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px]" dir="rtl">
        <DialogHeader className="flex flex-col items-center gap-2">
          <div className="p-3 rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <DialogTitle>تأكيد حذف المشروع</DialogTitle>
          <DialogDescription className="text-center">
            هل أنت متأكد من رغبتك في حذف مشروع "{projectTitle}"؟ 
            {isDraft ? " (مسودة)" : ""}
            <br />
            لا يمكن التراجع عن هذا الإجراء.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6 sm:justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            إلغاء
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "جارٍ الحذف..." : "حذف المشروع"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
