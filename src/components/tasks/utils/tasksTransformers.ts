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

// Transform regular tasks to unified format
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
      workspace_name: task.is_general ? 'مهمة عامة' : 'مساحة عمل افتراضية',
      is_subtask: false,
      is_general: task.is_general || false
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
      status: subtask.status as Task['status'],
      due_date: subtask.due_date,
      priority: 'medium',
      project_name: projectName,
      project_id: parentProjectId,
      workspace_name: parentTask.workspace_name || 'مساحة عمل افتراضية',
      is_subtask: true,
      parent_task_id: subtask.task_id
    };
  });
};
