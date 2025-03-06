
import { Task } from "../types/task";

export const buildProjectsMap = (projectsData: any[]) => {
  const projects: Record<string, string> = {};
  const validProjectIds: Set<string> = new Set();
  
  projectsData.forEach(project => {
    if (project.id && project.title) {
      projects[project.id] = project.title;
      validProjectIds.add(project.id);
    }
  });
  
  console.log("Projects map:", projects);
  console.log("Valid project IDs:", Array.from(validProjectIds));
  
  return { projects, validProjectIds };
};

export const buildParentTasksMap = (portfolioTasks: any[], regularTasks: any[], allTasks: any[], validProjectIds: Set<string>, projects: Record<string, string>) => {
  const parentTasks: Record<string, any> = {};
  
  // Process portfolio tasks
  portfolioTasks.forEach(task => {
    parentTasks[task.id] = {
      ...task,
      project_name: task.portfolio_only_projects && task.portfolio_only_projects[0]?.name || null
    };
  });
  
  // Process regular tasks
  const filteredRegularTasks = regularTasks.filter(task => {
    if (task.is_general || !task.project_id) return true;
    return validProjectIds.has(task.project_id);
  });
  
  console.log("Filtered regular tasks:", filteredRegularTasks?.length);
  
  filteredRegularTasks.forEach(task => {
    const projectName = task.project_id && projects[task.project_id] ? projects[task.project_id] : null;
    parentTasks[task.id] = {
      ...task,
      project_name: projectName
    };
    console.log(`Stored parent task ${task.id} with project_name: ${projectName}`);
  });
  
  // Process all tasks to help with subtasks
  const filteredAllTasks = allTasks.filter(task => {
    if (!task.project_id) return true;
    return validProjectIds.has(task.project_id);
  });
  
  filteredAllTasks.forEach(task => {
    if (!parentTasks[task.id]) {
      const projectName = task.project_id && projects[task.project_id] ? projects[task.project_id] : null;
      parentTasks[task.id] = {
        id: task.id,
        title: task.title,
        project_id: task.project_id,
        project_name: projectName
      };
      console.log(`Stored additional parent task ${task.id} with project_name: ${projectName}`);
    }
  });
  
  return { parentTasks, filteredRegularTasks };
};

export const filterSubtasks = (subtasks: any[], parentTasks: Record<string, any>, validProjectIds: Set<string>) => {
  const filteredSubtasks = subtasks.filter(subtask => {
    const parentTask = parentTasks[subtask.task_id];
    if (!parentTask) return false; // Unknown parent task
    if (!parentTask.project_id) return true; // Parent task not linked to a project
    
    return validProjectIds.has(parentTask.project_id);
  });
  
  console.log("Filtered subtasks:", filteredSubtasks?.length);
  
  if (filteredSubtasks && filteredSubtasks.length > 0) {
    filteredSubtasks.forEach(subtask => {
      const parentTaskInfo = parentTasks[subtask.task_id];
      console.log(`Subtask ${subtask.id} parent task info:`, 
        parentTaskInfo ? {
          id: parentTaskInfo.id,
          title: parentTaskInfo.title,
          project_id: parentTaskInfo.project_id,
          project_name: parentTaskInfo.project_name
        } : 'Parent task not found');
    });
  }
  
  return filteredSubtasks;
};

export const sortTasksByDueDate = (tasks: Task[]) => {
  return tasks.sort((a, b) => {
    // Tasks with due dates come first
    if (a.due_date && !b.due_date) return -1;
    if (!a.due_date && b.due_date) return 1;
    if (!a.due_date && !b.due_date) return 0;
    
    // Sort by due date (ascending)
    return new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime();
  });
};
