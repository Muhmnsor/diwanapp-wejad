
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/refactored-auth";
import { Task } from "../types/task";
import { 
  fetchPortfolioTasks, 
  fetchRegularTasks, 
  fetchSubtasks,
  fetchProjectDetails,
  fetchParentTasks
} from "../services/tasksService";
import { 
  transformPortfolioTasks, 
  transformRegularTasks, 
  transformSubtasks 
} from "../utils/tasksTransformers";

export type { Task };
// إزالة التصدير الافتراضي الذي يسبب الخطأ
export type { TaskStatus } from "../types/task";

export const useAssignedTasks = () => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['all-assigned-tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Fetching all assigned tasks for user:', user.id);
      
      try {
        // 1. جلب جميع أنواع المهام
        const portfolioTasks = await fetchPortfolioTasks(user.id);
        const regularTasks = await fetchRegularTasks(user.id);
        const subtasks = await fetchSubtasks(user.id);
        
        // 2. استخراج معرفات المشاريع والمهام الرئيسية
        const projectIds = regularTasks
          ?.filter(task => task.project_id)
          .map(task => task.project_id) || [];
        
        const taskIds = subtasks
          ?.filter(subtask => subtask.task_id)
          .map(subtask => subtask.task_id) || [];
        
        // 3. جلب بيانات المشاريع والمهام الرئيسية
        const projectsMap = await fetchProjectDetails(projectIds);
        const parentTasksMap = await fetchParentTasks(taskIds);
        
        // 4. تحويل البيانات إلى التنسيق المطلوب
        const formattedPortfolioTasks = transformPortfolioTasks(portfolioTasks);
        const formattedRegularTasks = transformRegularTasks(regularTasks, projectsMap);
        const formattedSubtasks = transformSubtasks(subtasks, parentTasksMap, projectsMap);
        
        // 5. دمج جميع أنواع المهام
        const allTasks = [...formattedPortfolioTasks, ...formattedRegularTasks, ...formattedSubtasks];
        
        console.log('All assigned tasks:', allTasks);
        return allTasks;
      } catch (error) {
        console.error("Error in useAssignedTasks:", error);
        throw error;
      }
    },
    enabled: !!user?.id
  });
};
