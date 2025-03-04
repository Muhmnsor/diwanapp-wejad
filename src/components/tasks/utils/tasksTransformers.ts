
import { Task } from "../types/task";

// تحويل مهام المحفظة إلى تنسيق موحد
export const transformPortfolioTasks = (portfolioTasks: any[]): Task[] => {
  return portfolioTasks.map(task => {
    // الوصول الآمن للخصائص المتداخلة
    let projectName = null;
    if (task.portfolio_only_projects && 
        Array.isArray(task.portfolio_only_projects) && 
        task.portfolio_only_projects.length > 0 && 
        task.portfolio_only_projects[0]?.name) {
      projectName = task.portfolio_only_projects[0].name;
    }
    
    // أيضًا الحصول على اسم مساحة العمل إذا كان متاحًا
    let workspaceName = '';
    if (task.portfolio_workspaces && 
        Array.isArray(task.portfolio_workspaces) && 
        task.portfolio_workspaces.length > 0 && 
        task.portfolio_workspaces[0]?.name) {
      workspaceName = task.portfolio_workspaces[0].name;
    }
    
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      due_date: task.due_date,
      priority: task.priority,
      project_name: projectName,
      workspace_name: workspaceName,
      is_subtask: false
    };
  });
};

// تحويل المهام العادية إلى تنسيق موحد
export const transformRegularTasks = (regularTasks: any[], projectsMap: Record<string, string>): Task[] => {
  return regularTasks.map(task => {
    const projectName = task.project_id && projectsMap[task.project_id] 
      ? projectsMap[task.project_id] 
      : null;
      
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status as Task['status'],
      due_date: task.due_date,
      priority: task.priority,
      project_name: projectName,
      project_id: task.project_id,
      workspace_name: 'مساحة عمل افتراضية', // اسم مساحة العمل الافتراضية
      is_subtask: false
    };
  });
};

// تحويل المهام الفرعية إلى تنسيق موحد
export const transformSubtasks = (
  subtasks: any[], 
  parentTasksMap: Record<string, any>,
  projectsMap: Record<string, string>
): Task[] => {
  return subtasks.map(subtask => {
    const parentTask = parentTasksMap[subtask.task_id] || {};
    const parentProjectId = parentTask.project_id;
    
    // تحسين الوصول إلى اسم المشروع للمهام الفرعية بشكل كبير
    let projectName = null;
    
    // محاولة الحصول على اسم المشروع من المهمة الأصلية مباشرة
    if (parentTask.project_name) {
      projectName = parentTask.project_name;
      console.log(`Subtask ${subtask.id} got project name ${projectName} from parent task`);
    } 
    // إذا لم يكن متاحًا في المهمة الأصلية، حاول الحصول عليه من معرف المشروع باستخدام خريطة المشاريع
    else if (parentProjectId && projectsMap[parentProjectId]) {
      projectName = projectsMap[parentProjectId];
      console.log(`Subtask ${subtask.id} got project name ${projectName} from projects map`);
    }

    // التأكد من وجود اسم المشروع
    if (!projectName) {
      console.log(`⚠️ No project name found for subtask ${subtask.id}, parent task: ${subtask.task_id}`);
      console.log('Parent task data:', parentTask);
      console.log('Project ID from parent:', parentProjectId);
    }
    
    return {
      id: subtask.id,
      title: subtask.title,
      description: null, // تعيين قيمة افتراضية للوصف كـ null
      status: subtask.status as Task['status'],
      due_date: subtask.due_date,
      priority: 'medium', // تعيين قيمة افتراضية للأولوية
      project_name: projectName,
      workspace_name: parentTask.workspace_name || 'مساحة عمل افتراضية',
      is_subtask: true,
      parent_task_id: subtask.task_id
    };
  });
};
