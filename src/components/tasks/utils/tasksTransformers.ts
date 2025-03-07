
import { Task } from "../types/task";

// Transform portfolio tasks to unified format
export const transformPortfolioTasks = (portfolioTasks: any[]): Task[] => {
  return portfolioTasks.map(task => {
    let projectName = null;
    if (task.portfolio_only_projects && 
        Array.isArray(task.portfolio_only_projects) && 
        task.portfolio_only_projects.length > 0 && 
        task.portfolio_only_projects[0]?.name) {
      projectName = task.portfolio_only_projects[0].name;
    }
    
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
      description: task.description || null,
      status: (task.status || 'pending') as Task['status'],
      due_date: task.due_date || null,
      priority: (task.priority || 'medium') as Task['priority'],
      project_name: projectName,
      workspace_name: workspaceName,
      is_subtask: false,
      
      // Required fields from Task interface
      workspace_id: task.workspace_id || '',
      created_at: task.created_at || new Date().toISOString(),
      updated_at: task.updated_at || new Date().toISOString(),
      assigned_to: task.assigned_to || null,
      project_id: task.project_id || null
    };
  });
};

// Transform regular tasks to unified format
export const transformRegularTasks = (regularTasks: any[], projectsMap: Record<string, string>): Task[] => {
  return regularTasks.map(task => {
    const projectName = task.project_id && projectsMap[task.project_id] 
      ? projectsMap[task.project_id] 
      : null;
      
    return {
      id: task.id,
      title: task.title,
      description: task.description || null,
      status: (task.status || 'pending') as Task['status'],
      due_date: task.due_date || null,
      priority: (task.priority || 'medium') as Task['priority'],
      project_name: projectName,
      project_id: task.project_id || null,
      workspace_name: task.is_general ? 'مهمة عامة' : 'مساحة عمل افتراضية',
      is_subtask: false,
      is_general: task.is_general || false,
      
      // Required fields from Task interface
      workspace_id: task.workspace_id || '',
      created_at: task.created_at || new Date().toISOString(),
      updated_at: task.updated_at || new Date().toISOString(),
      assigned_to: task.assigned_to || null
    };
  });
};

// Transform subtasks to unified format
export const transformSubtasks = (
  subtasks: any[], 
  parentTasksMap: Record<string, any>,
  projectsMap: Record<string, string>
): Task[] => {
  return subtasks.map(subtask => {
    const parentTask = parentTasksMap[subtask.task_id] || {};
    
    const parentProjectId = parentTask.project_id;
    
    let projectName = null;
    
    if (parentTask.project_name) {
      projectName = parentTask.project_name;
      console.log(`Subtask ${subtask.id} using parent task's project_name: ${projectName}`);
    }
    else if (parentProjectId && projectsMap[parentProjectId]) {
      projectName = projectsMap[parentProjectId];
      console.log(`Subtask ${subtask.id} using parent project_id: ${parentProjectId}, project_name: ${projectName}`);
    }
    else if (typeof parentTask.project_id === 'object' && parentTask.project_id && projectsMap[parentTask.project_id.id]) {
      projectName = projectsMap[parentTask.project_id.id];
      console.log(`Subtask ${subtask.id} using parent project_id object: ${JSON.stringify(parentTask.project_id)}, project_name: ${projectName}`);
    }
    else if (subtask.task_id) {
      for (const projId in projectsMap) {
        if (projectsMap[projId]) {
          console.log(`Trying to match subtask ${subtask.id} with project ID ${projId}`);
          projectName = projectsMap[projId];
          break;
        }
      }
    }
    
    console.log(`Subtask transformation result for ${subtask.id}: project_name=${projectName}, parent_task=${parentTask.id}`);
    
    return {
      id: subtask.id,
      title: subtask.title,
      description: null,
      status: (subtask.status || 'pending') as Task['status'],
      due_date: subtask.due_date || null,
      priority: 'medium' as Task['priority'],
      project_name: projectName,
      project_id: parentProjectId || null,
      workspace_name: parentTask.workspace_name || 'مساحة عمل افتراضية',
      is_subtask: true,
      parent_task_id: subtask.task_id,
      
      // Required fields from Task interface
      workspace_id: parentTask.workspace_id || '',
      created_at: subtask.created_at || new Date().toISOString(),
      updated_at: subtask.updated_at || new Date().toISOString(),
      assigned_to: subtask.assigned_to || null
    };
  });
};
