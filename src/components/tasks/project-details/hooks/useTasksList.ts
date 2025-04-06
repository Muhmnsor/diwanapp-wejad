
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "../types/task";
import { toast } from "sonner";

export const useTasksList = (projectId?: string, meetingId?: string, isWorkspace = false) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [projectStages, setProjectStages] = useState<{ id: string; name: string }[]>([]);
  const [tasksByStage, setTasksByStage] = useState<Record<string, Task[]>>({});
  
  // Determine if this is a general tasks view (no project ID)
  const isGeneral = !projectId || projectId === "";
  
  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log(`Fetching tasks for ${isWorkspace ? 'workspace' : meetingId ? 'meeting' : isGeneral ? 'general' : 'project'} ID: ${projectId || meetingId || 'none'}`);
      
      // MAIN CHANGE: Modify query to include assigned user data through proper join
      let query = supabase
        .from('tasks')
        .select(`
          *,
          assigned_user:assigned_to (display_name, email)
        `);
      
      if (isWorkspace && projectId) {
        // Fetch tasks for a workspace
        query = query.eq('workspace_id', projectId);
      } else if (meetingId) {
        // Fetch tasks for a meeting
        query = query.eq('meeting_id', meetingId);
      } else if (isGeneral) {
        // Fetch general tasks
        query = query.eq('is_general', true);
      } else if (projectId) {
        // Fetch project tasks
        query = query.eq('project_id', projectId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      console.log("Raw task data received:", data && data.length);
      
      if (data) {
        const formattedTasks = data.map(task => {
          // استخراج اسم المستخدم المكلف من البيانات
          let assigneeName = '';
          
          // Use assigned_user data from the join when available
          if (task.assigned_user) {
            console.log(`Task ${task.id} assigned_user:`, task.assigned_user);
            if (Array.isArray(task.assigned_user)) {
              // إذا كانت المعلومات في مصفوفة
              if (task.assigned_user.length > 0) {
                assigneeName = task.assigned_user[0].display_name || task.assigned_user[0].email || '';
              }
            } else {
              // إذا كانت المعلومات في كائن مباشر
              assigneeName = task.assigned_user.display_name || task.assigned_user.email || '';
            }
          }
          // Fallback to profiles if assigned_user is not available but profiles is
          else if (task.profiles) {
            console.log(`Task ${task.id} profiles:`, task.profiles);
            if (Array.isArray(task.profiles)) {
              if (task.profiles.length > 0) {
                assigneeName = task.profiles[0].display_name || task.profiles[0].email || '';
              }
            } else {
              assigneeName = task.profiles.display_name || task.profiles.email || '';
            }
          }
          
          // Check if assigned_to starts with "custom:" for custom assignees
          if (task.assigned_to && typeof task.assigned_to === 'string' && task.assigned_to.startsWith('custom:')) {
            assigneeName = task.assigned_to.replace('custom:', '');
          }
          
          console.log(`Task ${task.id} final assigneeName:`, assigneeName);
          
          return {
            ...task,
            id: task.id,
            title: task.title,
            description: task.description || "",
            status: task.status || "pending",
            priority: task.priority || "medium",
            due_date: task.due_date,
            assigned_to: task.assigned_to,
            // إضافة اسم المستخدم المكلف بالطريقتين للتوافقية
            assignee_name: assigneeName,
            assigned_user_name: assigneeName,
            project_id: task.project_id,
            stage_id: task.stage_id,
            created_at: task.created_at,
            category: task.category,
            meeting_id: task.meeting_id
          };
        });
        
        setTasks(formattedTasks);
        console.log("Formatted tasks with assignee names:", formattedTasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("حدث خطأ أثناء تحميل المهام");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, isGeneral, isWorkspace, meetingId]);
  
  // Fetch project stages if this is a project view
  const fetchProjectStages = useCallback(async () => {
    if (isGeneral || isWorkspace || !projectId || meetingId) {
      setProjectStages([]);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('project_stages')
        .select('*')
        .eq('project_id', projectId);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setProjectStages(data.map(stage => ({
          id: stage.id,
          name: stage.name
        })));
      } else {
        // Create default stages if none exist
        const defaultStages = [
          { name: "تخطيط", color: "blue" },
          { name: "تنفيذ", color: "amber" },
          { name: "مراجعة", color: "purple" },
          { name: "اكتمال", color: "green" }
        ];
        
        for (const stage of defaultStages) {
          await supabase.from('project_stages').insert({
            project_id: projectId,
            name: stage.name,
            color: stage.color
          });
        }
        
        // Fetch again
        const { data: newData } = await supabase
          .from('project_stages')
          .select('*')
          .eq('project_id', projectId);
          
        if (newData) {
          setProjectStages(newData.map(stage => ({
            id: stage.id,
            name: stage.name
          })));
        }
      }
    } catch (error) {
      console.error("Error fetching project stages:", error);
    }
  }, [projectId, isGeneral, isWorkspace, meetingId]);
  
  // Group tasks by stage
  useEffect(() => {
    const groupTasksByStage = () => {
      const grouped: Record<string, Task[]> = {};
      
      // Initialize with empty arrays for all stages
      projectStages.forEach(stage => {
        grouped[stage.id] = [];
      });
      
      // Add tasks to their respective stages
      tasks.forEach(task => {
        if (task.stage_id && grouped[task.stage_id]) {
          grouped[task.stage_id].push(task);
        } else if (projectStages.length > 0) {
          // If task has no stage, add to first stage
          const firstStageId = projectStages[0].id;
          grouped[firstStageId] = [...(grouped[firstStageId] || []), task];
        }
      });
      
      setTasksByStage(grouped);
    };
    
    if (!isGeneral && !isWorkspace && !meetingId) {
      groupTasksByStage();
    }
  }, [tasks, projectStages, isGeneral, isWorkspace, meetingId]);
  
  // Load data on mount and when projectId changes
  useEffect(() => {
    fetchTasks();
    fetchProjectStages();
  }, [fetchTasks, fetchProjectStages]);
  
  // Filter tasks based on active tab
  useEffect(() => {
    if (activeTab === "all") {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter(task => task.status === activeTab));
    }
  }, [tasks, activeTab]);
  
  // Handle stage changes
  const handleStagesChange = () => {
    fetchProjectStages();
  };
  
  // Handle status change
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Update local state
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId 
            ? { ...task, status: newStatus } 
            : task
        )
      );
      
      toast.success("تم تحديث حالة المهمة");
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("حدث خطأ أثناء تحديث حالة المهمة");
    }
  };
  
  // Delete task
  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Update local state
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      toast.success("تم حذف المهمة بنجاح");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("حدث خطأ أثناء حذف المهمة");
      throw error;
    }
  };
  
  return {
    tasks,
    filteredTasks,
    isLoading,
    activeTab,
    setActiveTab,
    isAddDialogOpen,
    setIsAddDialogOpen,
    projectStages,
    handleStagesChange,
    tasksByStage,
    handleStatusChange,
    fetchTasks,
    isGeneral,
    deleteTask
  };
};
