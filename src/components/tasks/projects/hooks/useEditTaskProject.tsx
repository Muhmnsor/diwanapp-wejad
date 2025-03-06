
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDate } from "@/utils/formatters";

export interface TaskProject {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  workspace_id: string;
  project_id: string | null;
  project_manager?: string | null;
  start_date?: string | null;
}

interface UseEditTaskProjectProps {
  project: TaskProject;
  onSuccess?: () => void;
  onClose: () => void;
  isOpen: boolean;
}

export const useEditTaskProject = ({
  project,
  onSuccess,
  onClose,
  isOpen
}: UseEditTaskProjectProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [managers, setManagers] = useState<{ id: string; name: string }[]>([]);
  
  // Fetch users list
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch users from profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .eq('is_active', true)
          .order('display_name');
          
        if (error) {
          console.error('Error fetching users:', error);
          setManagers([]);
          return;
        }
        
        // Transform the data for display
        const formattedManagers = data.map(user => ({
          id: user.id,
          name: user.display_name || user.email || 'مستخدم بدون اسم'
        }));
        
        setManagers(formattedManagers || []);
      } catch (error) {
        console.error('Error fetching managers:', error);
        setManagers([]);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);
  
  // Helper function to format date from database to YYYY-MM-DD format for input[type="date"]
  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return "";
    
    try {
      // Handle both full ISO string and date-only formats
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.log('Invalid date:', dateString);
        return "";
      }
      
      // Format as YYYY-MM-DD for input[type="date"]
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return "";
    }
  };
  
  const form = useForm({
    defaultValues: {
      name: project.title,
      description: project.description || "",
      project_manager: project.project_manager || "",
      start_date: formatDateForInput(project.start_date),
      end_date: formatDateForInput(project.due_date),
    }
  });

  // Reset form when project changes
  useEffect(() => {
    if (isOpen && project) {
      console.log("Project data:", project);
      console.log("Start date from API:", project.start_date);
      console.log("Due date from API:", project.due_date);
      console.log("Formatted start date:", formatDateForInput(project.start_date));
      console.log("Formatted due date:", formatDateForInput(project.due_date));
      
      form.reset({
        name: project.title,
        description: project.description || "",
        project_manager: project.project_manager || "",
        start_date: formatDateForInput(project.start_date),
        end_date: formatDateForInput(project.due_date),
      });
    }
  }, [isOpen, project, form]);

  const handleSubmit = async (values: any) => {
    if (!values.name.trim()) {
      toast.error("عنوان المشروع مطلوب");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Updating project with values:", values);
      
      const { error } = await supabase
        .from("project_tasks")
        .update({
          title: values.name,
          description: values.description,
          project_manager: values.project_manager === "no-manager" ? null : values.project_manager,
          start_date: values.start_date || null,
          due_date: values.end_date || null,
        })
        .eq("id", project.id);
      
      if (error) {
        throw error;
      }
      
      toast.success("تم تحديث المشروع بنجاح");
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("حدث خطأ أثناء تحديث المشروع");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    handleSubmit: form.handleSubmit(handleSubmit),
    managers
  };
};
