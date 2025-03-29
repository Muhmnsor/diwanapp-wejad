
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "../types/task";
import { toast } from "sonner";

export const useTasksFetching = (
  projectId?: string, 
  meetingId?: string, 
  isWorkspace: boolean = false
) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tasksByStage, setTasksByStage] = useState<Record<string, Task[]>>({});

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching tasks with params:", { projectId, meetingId, isWorkspace });
      
      let query = supabase
        .from('tasks')
        .select(`*`);

      // Filter based on what's provided - using clear logic for each task type
      if (isWorkspace && projectId) {
        // Case 1: Workspace tasks - specific to a workspace
        console.log("Fetching workspace tasks for workspace ID:", projectId);
        query = query.eq('workspace_id', projectId);
      } else if (meetingId) {
        // Case 2: Meeting tasks - tied to a specific meeting
        console.log("Fetching meeting tasks for meeting ID:", meetingId);
        query = query.eq('meeting_id', meetingId);
      } else if (projectId) {
        // Case 3: Project tasks - specific to a project
        console.log("Fetching project tasks for project ID:", projectId);
        query = query.eq('project_id', projectId);
      } else {
        // Case 4: General tasks - not tied to any specific entity
        console.log("Fetching general tasks");
        query = query.eq('is_general', true);
      }

      const { data: tasksData, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching tasks:", error);
        throw error;
      }

      console.log("Fetched tasks raw data:", tasksData);

      // If no tasks, return empty array
      if (!tasksData || tasksData.length === 0) {
        setTasks([]);
        setTasksByStage({});
        setIsLoading(false);
        return [];
      }

      // Extract all user IDs from assigned_to field
      const userIds = tasksData
        .map(task => task.assigned_to)
        .filter(id => id !== null && id !== undefined);

      // Create a Set to get unique user IDs
      const uniqueUserIds = [...new Set(userIds)];
      
      // If there are assigned users, fetch their profiles
      let userMap: Record<string, { display_name: string, email: string }> = {};
      
      if (uniqueUserIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .in('id', uniqueUserIds);
        
        if (usersError) {
          console.error("Error fetching user profiles:", usersError);
        } else if (usersData) {
          // Create a map of user ID to user info
          userMap = usersData.reduce((acc, user) => {
            acc[user.id] = {
              display_name: user.display_name,
              email: user.email
            };
            return acc;
          }, {} as Record<string, { display_name: string, email: string }>);
        }
      }

      // Fetch stage information if necessary
      let stagesMap: Record<string, { name: string }> = {};
      
      // Extract all stage IDs
      const stageIds = tasksData
        .map(task => task.stage_id)
        .filter(id => id !== null && id !== undefined);
      
      // If there are stages, fetch their details
      if (stageIds.length > 0) {
        const { data: stagesData, error: stagesError } = await supabase
          .from('project_stages')
          .select('id, name')
          .in('id', [...new Set(stageIds)]);
        
        if (stagesError) {
          console.error("Error fetching stages:", stagesError);
        } else if (stagesData) {
          // Create a map of stage ID to stage info
          stagesMap = stagesData.reduce((acc, stage) => {
            acc[stage.id] = { name: stage.name };
            return acc;
          }, {} as Record<string, { name: string }>);
        }
      }

      // Transform data to add user info and stage name
      const transformedTasks = tasksData.map(task => {
        // Safely extract the assigned user name
        let assignedUserName = 'غير محدد';
        if (task.assigned_to && userMap[task.assigned_to]) {
          assignedUserName = userMap[task.assigned_to].display_name || 
                            userMap[task.assigned_to].email || 
                            'غير محدد';
        }

        // Safely extract stage name
        let stageName = '';
        if (task.stage_id && stagesMap[task.stage_id]) {
          stageName = stagesMap[task.stage_id].name || '';
        }

        return {
          ...task,
          assigned_user_name: assignedUserName,
          stage_name: stageName,
        };
      });

      console.log("Transformed tasks with user names:", transformedTasks);

      setTasks(transformedTasks);

      // Group tasks by stage for project tasks with stages
      if (projectId && !isWorkspace && !meetingId) {
        const groupedTasks: Record<string, Task[]> = {};
        transformedTasks.forEach(task => {
          if (task.stage_id) {
            if (!groupedTasks[task.stage_id]) {
              groupedTasks[task.stage_id] = [];
            }
            groupedTasks[task.stage_id].push(task);
          }
        });
        setTasksByStage(groupedTasks);
      }

      return transformedTasks;
    } catch (error) {
      console.error("Error in fetchTasks:", error);
      toast.error("حدث خطأ أثناء تحميل المهام");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId, meetingId, isWorkspace]);

  return {
    tasks,
    isLoading,
    tasksByStage,
    setTasks,
    setTasksByStage,
    fetchTasks
  };
};
