
import { supabase } from "@/integrations/supabase/client";

interface TaskProject {
  id: string;
  title: string;
  description: string | null;
  workspace_id: string;
  project_manager?: string | null;
  project_manager_name?: string | null;
  due_date?: string | null;
  status?: string;
  priority?: string;
}

interface CopyOptions {
  newTitle: string;
  keepAssignees: boolean;
  copyTemplates: boolean;
}

export const copyTaskProject = async (project: TaskProject, options: CopyOptions) => {
  try {
    // Step 1: Create a copy of the main project
    const { data: newProject, error: projectError } = await supabase
      .from('project_tasks')
      .insert([
        {
          title: options.newTitle,
          description: project.description,
          workspace_id: project.workspace_id,
          project_manager: project.project_manager,
          due_date: project.due_date,
          status: 'pending', // Always start as pending
          priority: project.priority,
          copied_from: project.id,
          is_draft: true // Always start as draft
        }
      ])
      .select()
      .single();
    
    if (projectError) throw projectError;
    
    console.log("Created new project:", newProject);
    
    // Step 2: Copy project stages
    const { data: stages, error: stagesError } = await supabase
      .from('project_stages')
      .select('*')
      .eq('project_id', project.id);
    
    if (stagesError) throw stagesError;
    
    // Create a mapping of old stage IDs to new stage IDs
    const stageMapping: Record<string, string> = {};
    
    if (stages && stages.length > 0) {
      // Insert all stages for the new project
      const newStages = stages.map(stage => ({
        name: stage.name,
        color: stage.color,
        project_id: newProject.id
      }));
      
      const { data: createdStages, error: createStagesError } = await supabase
        .from('project_stages')
        .insert(newStages)
        .select();
      
      if (createStagesError) throw createStagesError;
      
      // Create mapping of old stage IDs to new stage IDs
      if (createdStages) {
        for (let i = 0; i < stages.length; i++) {
          stageMapping[stages[i].id] = createdStages[i].id;
        }
      }
    }
    
    // Step 3: Copy tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', project.id);
    
    if (tasksError) throw tasksError;
    
    // Create a mapping of old task IDs to new task IDs
    const taskMapping: Record<string, string> = {};
    
    if (tasks && tasks.length > 0) {
      // Insert all tasks for the new project
      const newTasks = tasks.map(task => ({
        title: task.title,
        description: task.description,
        status: 'pending', // Reset status to pending for the new project
        priority: task.priority,
        due_date: task.due_date,
        assigned_to: options.keepAssignees ? task.assigned_to : null,
        project_id: newProject.id,
        workspace_id: task.workspace_id,
        category: task.category,
        stage_id: task.stage_id ? stageMapping[task.stage_id] : null
      }));
      
      const { data: createdTasks, error: createTasksError } = await supabase
        .from('tasks')
        .insert(newTasks)
        .select();
      
      if (createTasksError) throw createTasksError;
      
      // Create a mapping of old task IDs to new task IDs
      if (createdTasks) {
        for (let i = 0; i < tasks.length; i++) {
          taskMapping[tasks[i].id] = createdTasks[i].id;
        }
      }
      
      // Step 4: Copy subtasks for each task
      for (const oldTaskId in taskMapping) {
        const newTaskId = taskMapping[oldTaskId];
        
        // Get subtasks for the old task
        const { data: subtasks, error: subtasksError } = await supabase
          .from('subtasks')
          .select('*')
          .eq('task_id', oldTaskId);
        
        if (subtasksError) {
          console.error(`Error fetching subtasks for task ${oldTaskId}:`, subtasksError);
          continue; // Skip this task if there's an error, but continue with others
        }
        
        if (subtasks && subtasks.length > 0) {
          // Create new subtasks for the new task
          const newSubtasks = subtasks.map(subtask => ({
            task_id: newTaskId,
            title: subtask.title,
            status: 'pending', // Reset status to pending
            due_date: subtask.due_date,
            assigned_to: options.keepAssignees ? subtask.assigned_to : null
          }));
          
          const { error: createSubtasksError } = await supabase
            .from('subtasks')
            .insert(newSubtasks);
          
          if (createSubtasksError) {
            console.error(`Error creating subtasks for task ${newTaskId}:`, createSubtasksError);
          }
        }
      }
      
      // Copy task templates if required
      if (options.copyTemplates && createdTasks && createdTasks.length > 0) {
        // Get all templates for the original tasks
        const { data: templates, error: templatesError } = await supabase
          .from('task_templates')
          .select('*')
          .in('task_id', tasks.map(t => t.id));
        
        if (templatesError) throw templatesError;
        
        if (templates && templates.length > 0) {
          // Create new templates
          const newTemplates = templates.map(template => ({
            task_id: taskMapping[template.task_id],
            file_url: template.file_url,
            file_name: template.file_name,
            file_type: template.file_type,
            task_table: template.task_table
          }));
          
          const { error: createTemplatesError } = await supabase
            .from('task_templates')
            .insert(newTemplates);
          
          if (createTemplatesError) throw createTemplatesError;
        }
      }
    }
    
    return newProject;
  } catch (error) {
    console.error("Error copying project:", error);
    throw error;
  }
};
