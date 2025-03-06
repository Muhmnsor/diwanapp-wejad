
import { supabase } from "@/integrations/supabase/client";

export const copyTaskBatch = async (tasks: any[], newProjectId: string, stageMapping: Record<string, string>) => {
  try {
    const newTasks = tasks.map(task => ({
      title: task.title,
      description: task.description,
      status: "draft",
      priority: task.priority,
      assigned_to: task.assigned_to,
      project_id: newProjectId,
      workspace_id: task.workspace_id,
      stage_id: task.stage_id ? stageMapping[task.stage_id] || null : null,
      due_date: task.due_date,
      project_manager: task.project_manager,
      start_date: task.start_date,
      is_draft: true
    }));

    const { error } = await supabase
      .from("project_tasks")
      .insert(newTasks);

    if (error) {
      throw new Error(`فشل في نسخ المهام: ${error.message}`);
    }
  } catch (error) {
    console.error("Error in copyTaskBatch:", error);
    throw error;
  }
};

export const copyTaskAttachments = async (originalTaskId: string, newTaskId: string) => {
  try {
    const { data: attachments } = await supabase
      .from("unified_task_attachments")
      .select("*")
      .eq("task_id", originalTaskId)
      .eq("task_table", "project_tasks");
      
    if (attachments?.length > 0) {
      const newAttachments = attachments.map(att => ({
        task_id: newTaskId,
        file_url: att.file_url,
        file_name: att.file_name,
        file_type: att.file_type,
        attachment_category: att.attachment_category,
        task_table: "project_tasks"
      }));
      
      const { error: attachError } = await supabase
        .from("unified_task_attachments")
        .insert(newAttachments);
        
      if (attachError) {
        console.error("Error copying attachments:", attachError);
      }
    }
    return attachments?.length || 0;
  } catch (error) {
    console.error("Error copying task attachments:", error);
    return 0;
  }
};

export const copyTaskTemplates = async (originalTaskId: string, newTaskId: string) => {
  try {
    const { data: templates } = await supabase
      .from("task_templates")
      .select("*")
      .eq("task_id", originalTaskId)
      .eq("task_table", "project_tasks");
      
    if (templates?.length > 0) {
      const newTemplates = templates.map(tmpl => ({
        task_id: newTaskId,
        file_url: tmpl.file_url,
        file_name: tmpl.file_name,
        file_type: tmpl.file_type,
        task_table: "project_tasks"
      }));
      
      const { error: templateError } = await supabase
        .from("task_templates")
        .insert(newTemplates);
        
      if (templateError) {
        console.error("Error copying templates:", templateError);
      }
    }
    return templates?.length || 0;
  } catch (error) {
    console.error("Error copying task templates:", error);
    return 0;
  }
};
