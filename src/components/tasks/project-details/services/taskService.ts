
import { supabase } from "@/integrations/supabase/client";
import { TaskFormData } from "../types/addTask";

export const createTask = async (projectId: string, formData: TaskFormData) => {
  // Create the task
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: formData.title,
      description: formData.description,
      status: "pending",
      priority: formData.priority,
      due_date: formData.dueDate,
      project_id: projectId,
      stage_id: formData.stageId,
      assigned_to: formData.assignedTo === "none" ? null : formData.assignedTo,
      workspace_id: null
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateProjectStatusIfCompleted = async (projectId: string) => {
  // Check current project status
  const { data: projectData, error: projectError } = await supabase
    .from('project_tasks')
    .select('status')
    .eq('id', projectId)
    .single();
    
  if (projectError) {
    throw new Error(projectError.message);
  }

  // Update project status to in_progress if it was previously completed
  if (projectData && projectData.status === 'completed') {
    const { error: updateError } = await supabase
      .from('project_tasks')
      .update({ status: 'in_progress' })
      .eq('id', projectId);
      
    if (updateError) {
      throw new Error(updateError.message);
    }
  }

  return true;
};
