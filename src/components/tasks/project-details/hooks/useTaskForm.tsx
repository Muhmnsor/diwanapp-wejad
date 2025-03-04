import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TaskFormData } from "../types/taskForm";
import { ProjectMember } from "./useProjectMembers";
import { toast } from "sonner";
import { uploadAttachment } from "@/components/tasks/services/uploadService";

interface UseTaskFormProps {
  projectId: string | undefined;
  projectStages: { id: string; name: string }[];
  onSuccess: () => void;
  onOpenChange: (open: boolean) => void;
}

export const useTaskForm = ({ 
  projectId, 
  projectStages, 
  onSuccess, 
  onOpenChange 
}: UseTaskFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("low");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [stageId, setStageId] = useState(projectStages[0]?.id || "");
  const [assignedTo, setAssignedTo] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  
  // جلب قائمة المستخدمين
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .eq('is_active', true)
          .order('display_name', { ascending: true });

        if (error) {
          console.error("خطأ في جلب المستخدمين:", error);
          return;
        }

        if (data) {
          setProjectMembers(data.map(user => ({
            id: user.id,
            user_id: user.id,
            workspace_id: '',
            user_display_name: user.display_name || user.email || 'مستخدم بلا اسم',
            user_email: user.email || ''
          })));
        }
      } catch (error) {
        console.error("خطأ في جلب المستخدمين:", error);
      }
    };

    fetchUsers();
  }, []);

  // Reset state when projectStages changes
  useEffect(() => {
    if (projectStages.length > 0 && !stageId) {
      setStageId(projectStages[0]?.id || "");
    }
  }, [projectStages, stageId]);
  
  const handleFormSubmit = async (formData: TaskFormData) => {
    if (!projectId) {
      toast.error("معرف المشروع غير موجود");
      return;
    }

    try {
      setIsSubmitting(true);

      // Create the task
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          title: formData.title,
          description: formData.description,
          status: "pending",
          priority: formData.priority,
          due_date: formData.dueDate,
          project_id: projectId,
          stage_id: formData.stageId,
          assigned_to: formData.assignedTo === "none" ? null : formData.assignedTo,
          workspace_id: null
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating task:", error);
        toast.error("حدث خطأ أثناء إنشاء المهمة");
        return;
      }

      // Upload attachment if exists
      if (formData.attachment) {
        const uploadResult = await uploadAttachment(formData.attachment);
        if (uploadResult && uploadResult.url) {
          // Save attachment info to task_attachments table
          const { error: attachmentError } = await supabase
            .from("task_attachments")
            .insert({
              task_id: data.id,
              file_name: formData.attachment.name,
              file_url: uploadResult.url,
              created_by: (await supabase.auth.getUser()).data.user?.id
            });

          if (attachmentError) {
            console.error("Error saving attachment:", attachmentError);
            toast.error("تم إنشاء المهمة لكن حدث خطأ أثناء حفظ المرفق");
          }
        }
      }

      toast.success("تم إنشاء المهمة بنجاح");
      
      // Update project status to in_progress if it was previously completed
      const { data: projectData, error: projectError } = await supabase
        .from('project_tasks')
        .select('status')
        .eq('id', projectId)
        .single();
        
      if (!projectError && projectData && projectData.status === 'completed') {
        const { error: updateError } = await supabase
          .from('project_tasks')
          .update({ status: 'in_progress' })
          .eq('id', projectId);
          
        if (updateError) {
          console.error("Error updating project status:", updateError);
        }
      }
      
      // Reset the form and close the dialog
      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error in handleFormSubmit:", error);
      toast.error("حدث خطأ أثناء إنشاء المهمة");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("low");
    setDueDate(null);
    setStageId(projectStages[0]?.id || "");
    setAssignedTo("");
    setAttachment(null);
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    priority,
    setPriority,
    dueDate,
    setDueDate,
    stageId,
    setStageId,
    assignedTo,
    setAssignedTo,
    attachment,
    setAttachment,
    isSubmitting,
    projectMembers,
    handleFormSubmit,
    resetForm
  };
};
