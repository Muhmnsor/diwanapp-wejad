
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
  manager_name?: string | null;
  project_manager?: string | null;
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

        // Set project owner directly from project data if available
        if (project.manager_name) {
          setProjectOwner(project.manager_name);
        } else if (project.project_manager) {
          // If we have the project_manager ID but not the name, fetch the user's profile
          await fetchProjectOwnerFromId(project.project_manager);
        } else {
          setProjectOwner("غير محدد");
        }
      } catch (err) {
        console.error("Error in fetchTasksData:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasksData();
  }, [project.id, project.status, project.manager_name, project.project_manager]);

  const fetchProjectOwnerFromId = async (userId: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setProjectOwner("غير محدد");
        return;
      }
      
      setProjectOwner(profile?.display_name || profile?.email || "مدير المشروع");
    } catch (err) {
      console.error("Error in fetchProjectOwnerFromId:", err);
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

  return {
    completedTasksCount,
    totalTasksCount,
    overdueTasksCount,
    isLoading,
    completionPercentage,
    projectOwner,
    isEditDialogOpen,
    isDeleteDialogOpen,
    handleClick,
    handleEditClick,
    handleDeleteClick,
    handleProjectUpdated,
    handleProjectDeleted,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen
  };
};
