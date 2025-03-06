
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  start_date?: string | null;
}

interface CopyOptions {
  newTitle: string;
  keepAssignees: boolean;
  copyTemplates: boolean;
}

export const copyTaskProject = async (project: TaskProject, options: CopyOptions) => {
  try {
    console.log("Copying project:", project.id, "with options:", options);
    
    if (!project || !project.workspace_id) {
      throw new Error("Invalid project data - missing required fields");
    }
    
    // 1. Create a new project in draft mode
    const newProjectData = {
      title: options.newTitle,
      description: project.description,
      workspace_id: project.workspace_id,
      project_manager: project.project_manager,
      status: 'pending',
      priority: project.priority || 'medium',
      is_draft: true,
      copied_from: project.id,
      due_date: project.due_date
    };
    
    console.log("Creating new project with data:", newProjectData);
    
    const { data: newProject, error: projectError } = await supabase
      .from('project_tasks')
      .insert([newProjectData])
      .select()
      .single();
    
    if (projectError) {
      console.error("Error creating new project:", projectError);
      throw new Error(`Failed to create project: ${projectError.message}`);
    }
    
    if (!newProject) {
      throw new Error("New project not created - no data returned");
    }
    
    console.log("Created new project:", newProject);
    
    // 2. Fetch all tasks from the original project
    const { data: originalTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', project.id);
    
    if (tasksError) {
      console.error("Error fetching original tasks:", tasksError);
      throw new Error(`Failed to fetch original tasks: ${tasksError.message}`);
    }
    
    console.log("Fetched original tasks:", originalTasks?.length || 0);
    
    if (originalTasks && originalTasks.length > 0) {
      // 3. Create new tasks for the new project
      const newTasks = originalTasks.map(task => {
        return {
          title: task.title,
          description: task.description,
          project_id: newProject.id,
          status: 'pending', // Reset status
          priority: task.priority,
          workspace_id: task.workspace_id,
          assigned_to: options.keepAssignees ? task.assigned_to : null,
          category: task.category,
          stage_id: task.stage_id
        };
      });
      
      const { data: createdTasks, error: createTasksError } = await supabase
        .from('tasks')
        .insert(newTasks)
        .select();
      
      if (createTasksError) {
        console.error("Error creating new tasks:", createTasksError);
        throw new Error(`Failed to create tasks: ${createTasksError.message}`);
      }
      
      console.log("Created new tasks:", createdTasks?.length || 0);
      
      // 4. Copy templates if requested
      if (options.copyTemplates && createdTasks && createdTasks.length > 0) {
        for (let i = 0; i < originalTasks.length; i++) {
          const originalTaskId = originalTasks[i].id;
          const newTaskId = createdTasks[i].id;
          
          // Fetch templates for the original task
          const { data: templates, error: templatesError } = await supabase
            .from('task_templates')
            .select('*')
            .eq('task_id', originalTaskId);
          
          if (templatesError) {
            console.error(`Error fetching templates for task ${originalTaskId}:`, templatesError);
            // Continue with other tasks even if templates for one task fail
            continue;
          }
          
          if (templates && templates.length > 0) {
            // Create new templates for the new task
            const newTemplates = templates.map(template => ({
              task_id: newTaskId,
              file_url: template.file_url,
              file_name: template.file_name,
              file_type: template.file_type,
              task_table: template.task_table
            }));
            
            const { error: createTemplatesError } = await supabase
              .from('task_templates')
              .insert(newTemplates);
            
            if (createTemplatesError) {
              console.error(`Error creating templates for task ${newTaskId}:`, createTemplatesError);
            }
          }
        }
      }
    }
    
    return newProject;
  } catch (error) {
    console.error("Error in copyTaskProject:", error);
    throw error;
  }
};
