
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TaskProject {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  workspace_id: string;
  project_id: string | null;
  project_manager?: string | null;
  project_manager_name?: string | null;
}

export const useTaskProjectCard = (project: TaskProject, onProjectUpdated?: () => void) => {
  const navigate = useNavigate();
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [totalTasksCount, setTotalTasksCount] = useState(0);
  const [overdueTasksCount, setOverdueTasksCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [projectOwner, setProjectOwner] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);

  useEffect(() => {
    const fetchTasksData = async () => {
      setIsLoading(true);
      try {
        const { data: tasks, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', project.id);
        
        if (error) {
          console.error("Error fetching tasks:", error);
          return;
        }

        const total = tasks ? tasks.length : 0;
        const completed = tasks ? tasks.filter(task => task.status === 'completed').length : 0;
        
        const now = new Date();
        const overdue = tasks ? tasks.filter(task => {
          return task.status !== 'completed' && 
                task.due_date && 
                new Date(task.due_date) < now;
        }).length : 0;

        setTotalTasksCount(total);
        setCompletedTasksCount(completed);
        setOverdueTasksCount(overdue);
        
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        setCompletionPercentage(percentage);
        
        if (percentage === 100 && project.status !== 'completed' && total > 0) {
          console.log(`Project ${project.id} is 100% complete, updating status to completed`);
          
          const { error: updateError } = await supabase
            .from('project_tasks')
            .update({ status: 'completed' })
            .eq('id', project.id);
            
          if (updateError) {
            console.error("Error updating project status:", updateError);
          }
        }

        // Use the project manager name that is already fetched
        if (project.project_manager_name) {
          setProjectOwner(project.project_manager_name);
        } else {
          await fetchProjectOwner();
        }
      } catch (err) {
        console.error("Error in fetchTasksData:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasksData();
  }, [project.id, project.status, project.project_manager_name]);

  const fetchProjectOwner = async () => {
    // This is a fallback if project_manager_name is not provided
    try {
      if (project.project_manager) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('display_name, email')
          .eq('id', project.project_manager)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setProjectOwner("غير محدد");
          return;
        }
        
        setProjectOwner(profile?.display_name || profile?.email || "غير محدد");
      } else {
        // Fallback to the original logic for backward compatibility
        const { data: tasks, error } = await supabase
          .from('tasks')
          .select('assigned_to')
          .eq('project_id', project.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (error) {
          console.error("Error fetching tasks for project owner:", error);
          setProjectOwner("غير محدد");
          return;
        }

        if (tasks && tasks.length > 0 && tasks[0].assigned_to) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('display_name, email')
            .eq('id', tasks[0].assigned_to)
            .single();
            
          if (profileError) {
            console.error("Error fetching profile:", profileError);
            setProjectOwner("غير محدد");
            return;
          }
          
          setProjectOwner(profile?.display_name || profile?.email || "مدير المشروع");
        } else {
          setProjectOwner("غير محدد");
        }
      }
    } catch (err) {
      console.error("Error in fetchProjectOwner:", err);
      setProjectOwner("غير محدد");
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.project-actions')) {
      e.stopPropagation();
      return;
    }
    navigate(`/tasks/project/${project.id}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCopyDialogOpen(true);
  };

  const handleProjectUpdated = () => {
    toast.success("تم تحديث المشروع بنجاح");
    if (onProjectUpdated) {
      onProjectUpdated();
    }
  };

  const handleProjectDeleted = () => {
    toast.success("تم حذف المشروع بنجاح");
    if (onProjectUpdated) {
      onProjectUpdated();
    }
  };

  const handleProjectCopied = () => {
    toast.success("تم نسخ المشروع بنجاح");
    if (onProjectUpdated) {
      onProjectUpdated();
    }
  };

  return {
    completedTasksCount,
    totalTasksCount,
    overdueTasksCount,
    isLoading,
    completionPercentage,
    projectOwner,
    isEditDialogOpen,
    isDeleteDialogOpen,
    isCopyDialogOpen,
    handleClick,
    handleEditClick,
    handleDeleteClick,
    handleCopyClick,
    handleProjectUpdated,
    handleProjectDeleted,
    handleProjectCopied,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsCopyDialogOpen
  };
};
