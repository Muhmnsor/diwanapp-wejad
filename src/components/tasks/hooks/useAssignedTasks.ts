
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  transformPortfolioTasks, 
  transformRegularTasks, 
  transformSubtasks 
} from "../utils/tasksTransformers";
import type { Task } from "../types/task";
import { 
  fetchUserProjects, 
  fetchUserPortfolioTasks, 
  fetchUserRegularTasks, 
  fetchAllTasks, 
  fetchUserSubtasks 
} from "../services/assignedTasksService";
import { 
  buildProjectsMap, 
  buildParentTasksMap, 
  filterSubtasks, 
  sortTasksByDueDate 
} from "../utils/assignedTasksHelpers";

export type { Task };

export const useAssignedTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      console.log("Fetching tasks for user:", userId);
      
      // 1. Fetch active projects
      const projectsData = await fetchUserProjects();
      
      // Build projects map and valid project IDs set
      const { projects, validProjectIds } = buildProjectsMap(projectsData);
      
      // 2. Fetch portfolio tasks assigned to the user
      const { data: portfolioTasks, error: portfolioError } = await fetchUserPortfolioTasks(userId);
        
      if (portfolioError) {
        console.error("Error fetching portfolio tasks:", portfolioError);
      }
      
      // 3. Fetch regular tasks assigned to the user
      const { data: regularTasksData, error: regularError } = await fetchUserRegularTasks(userId);
        
      if (regularError) {
        console.error("Error fetching regular tasks:", regularError);
      }
      
      // 3.5 Also fetch all tasks to help with subtask relationships
      const allTasks = await fetchAllTasks();
      
      // Build parent tasks map and filter regular tasks
      const { parentTasks, filteredRegularTasks } = buildParentTasksMap(
        portfolioTasks, 
        regularTasksData, 
        allTasks, 
        validProjectIds, 
        projects
      );
      
      // 4. Fetch subtasks assigned to the user
      const { data: subtasks, error: subtasksError } = await fetchUserSubtasks(userId);
          
      if (subtasksError) {
        console.error("Error fetching subtasks:", subtasksError);
      }
      
      // Filter subtasks based on valid projects
      const filteredSubtasks = filterSubtasks(subtasks || [], parentTasks, validProjectIds);
      
      // Transform tasks to consistent format
      const transformedPortfolioTasks = transformPortfolioTasks(portfolioTasks || []);
      const transformedRegularTasks = transformRegularTasks(filteredRegularTasks || [], projects);
      const transformedSubtasks = transformSubtasks(filteredSubtasks || [], parentTasks, projects);
      
      // 5. Merge tasks and sort by due date
      const allTasksMerged = [
        ...transformedPortfolioTasks,
        ...transformedRegularTasks,
        ...transformedSubtasks
      ];
      
      const sortedTasks = sortTasksByDueDate(allTasksMerged);
      
      console.log("All tasks with project names:", sortedTasks.map(t => ({
        id: t.id,
        title: t.title,
        project_name: t.project_name,
        project_id: t.project_id,
        is_subtask: t.is_subtask,
        parent_task_id: t.parent_task_id
      })));
      
      setTasks(sortedTasks);
    } catch (err) {
      console.error("Error in useAssignedTasks:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };
  
  const refetch = () => {
    fetchTasks();
  };
  
  useEffect(() => {
    fetchTasks();
  }, []);
  
  return { tasks, loading, error, refetch };
};
