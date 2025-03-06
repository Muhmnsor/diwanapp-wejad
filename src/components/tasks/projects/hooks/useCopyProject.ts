
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CopyProgress {
  progress: number;
  step: string;
}

interface CopyProjectState {
  isLoading: boolean;
  copyProgress: number;
  copyStep: string;
  isComplete: boolean;
  error: string | null;
  newProjectId: string | null;
}

interface UseCopyProjectProps {
  projectId: string;
  newTitle: string;
  includeTasks: boolean;
  includeAttachments: boolean;
  includeStages: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

export const useCopyProject = ({
  projectId,
  newTitle,
  includeTasks,
  includeAttachments,
  includeStages,
  onSuccess,
  onClose
}: UseCopyProjectProps) => {
  const [state, setState] = useState<CopyProjectState>({
    isLoading: false,
    copyProgress: 0,
    copyStep: "",
    isComplete: false,
    error: null,
    newProjectId: null
  });

  const updateProgress = (progress: number, step: string) => {
    setState(prev => ({
      ...prev,
      copyProgress: progress,
      copyStep: step
    }));
  };

  const resetState = () => {
    setState({
      isLoading: false,
      copyProgress: 0,
      copyStep: "",
      isComplete: false,
      error: null,
      newProjectId: null
    });
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    resetState();
    
    if (!newTitle.trim()) {
      toast.error("يرجى إدخال عنوان للمشروع الجديد");
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));
    updateProgress(0, "جاري إعداد النسخة...");
    
    try {
      // Step 1: Fetch original project
      updateProgress(10, "جاري جلب بيانات المشروع الأصلي...");
      const { data: originalProject, error: projectError } = await supabase
        .from("project_tasks")
        .select("*")
        .eq("id", projectId)
        .single();

      if (projectError) throw new Error("فشل في جلب بيانات المشروع الأصلي");
      if (!originalProject) throw new Error("لم يتم العثور على المشروع الأصلي");

      // Step 2: Create new project
      updateProgress(20, "إنشاء المشروع الجديد...");
      const { data: newProject, error: createError } = await supabase
        .from("project_tasks")
        .insert([{
          title: newTitle,
          description: originalProject.description,
          status: "pending",
          workspace_id: originalProject.workspace_id,
          project_id: originalProject.project_id,
          due_date: originalProject.due_date,
          copied_from: projectId,
          is_draft: true,
          project_manager: originalProject.project_manager,
          start_date: originalProject.start_date
        }])
        .select()
        .single();

      if (createError) throw new Error("فشل في إنشاء المشروع الجديد");
      if (!newProject) throw new Error("تم إنشاء المشروع لكن لم يتم العثور على البيانات");

      setState(prev => ({ ...prev, newProjectId: newProject.id }));

      // Step 3: Copy stages if enabled
      if (includeStages) {
        await copyProjectStages(originalProject.id, newProject.id);
      }

      // Step 4: Copy tasks if enabled
      if (includeTasks) {
        await copyProjectTasks(originalProject.id, newProject.id, includeAttachments);
      }

      // Complete
      updateProgress(100, "تم نسخ المشروع بنجاح!");
      setState(prev => ({ ...prev, isComplete: true }));
      toast.success("تم نسخ المشروع بنجاح");
      
      // Close dialog and trigger success
      setTimeout(() => {
        onClose();
        setTimeout(() => {
          resetState();
          onSuccess();
        }, 100);
      }, 1500);
      
    } catch (error) {
      console.error("Error copying project:", error);
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء نسخ المشروع";
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        copyStep: "حدث خطأ أثناء نسخ المشروع",
        isLoading: false 
      }));
      toast.error(errorMessage);
    }
  };

  const copyProjectStages = async (originalProjectId: string, newProjectId: string) => {
    updateProgress(30, "جاري نسخ مراحل المشروع...");
    
    try {
      const { data: originalStages, error: stagesError } = await supabase
        .from("project_stages")
        .select("*")
        .eq("project_id", originalProjectId);
        
      if (stagesError) throw new Error("فشل في جلب مراحل المشروع الأصلي");
      
      if (originalStages?.length > 0) {
        updateProgress(35, `جاري نسخ ${originalStages.length} مرحلة...`);
        
        const newStages = originalStages.map(stage => ({
          name: stage.name,
          project_id: newProjectId,
          color: stage.color || '#60A5FA' // Use default color if not present
        }));
        
        const { error: insertStagesError } = await supabase
          .from("project_stages")
          .insert(newStages);
          
        if (insertStagesError) {
          console.error("Error copying stages:", insertStagesError);
          throw new Error("فشل في نسخ مراحل المشروع");
        }
        
        updateProgress(40, "تم نسخ مراحل المشروع بنجاح");
      } else {
        updateProgress(40, "لا توجد مراحل للنسخ");
      }
    } catch (error) {
      console.error("Error in copyProjectStages:", error);
      // Continue with the process but inform the user about the stage copying issue
      toast.error("تعذر نسخ مراحل المشروع، لكن سيستمر نسخ باقي المشروع");
      updateProgress(40, "تعذر نسخ المراحل، جاري المتابعة...");
      // Don't rethrow to allow the rest of the copy to continue
    }
  };

  const copyProjectTasks = async (originalProjectId: string, newProjectId: string, includeAttachments: boolean) => {
    updateProgress(45, "جاري جلب المهام من المشروع الأصلي...");
    
    try {
      const { data: originalTasks, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", originalProjectId);

      if (tasksError) throw new Error("فشل في جلب مهام المشروع الأصلي");

      if (originalTasks?.length > 0) {
        const BATCH_SIZE = 10;
        const totalBatches = Math.ceil(originalTasks.length / BATCH_SIZE);
        
        // Create stage mapping for the new project
        let stageMapping: Record<string, string> = {};
        if (includeStages) {
          stageMapping = await createStageMapping(originalProjectId, newProjectId);
        }

        // Process tasks in batches
        for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
          const start = batchIndex * BATCH_SIZE;
          const end = Math.min(start + BATCH_SIZE, originalTasks.length);
          const currentBatch = originalTasks.slice(start, end);
          
          const progressPercent = 60 + (batchIndex / totalBatches) * 15;
          updateProgress(
            progressPercent, 
            `جاري نسخ المهام (${start + 1} إلى ${end} من ${originalTasks.length})...`
          );

          await copyTaskBatch(currentBatch, newProjectId, stageMapping);
          
          if (includeAttachments) {
            await copyAttachments(currentBatch, newProjectId);
          }
          
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } else {
        updateProgress(75, "لا توجد مهام للنسخ");
      }
    } catch (error) {
      console.error("Error in copyProjectTasks:", error);
      throw new Error(`فشل في نسخ المهام: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    }
  };

  const createStageMapping = async (originalProjectId: string, newProjectId: string): Promise<Record<string, string>> => {
    try {
      const { data: originalStageIds } = await supabase
        .from("project_stages")
        .select("id, name")
        .eq("project_id", originalProjectId);
        
      const { data: newStageIds } = await supabase
        .from("project_stages")
        .select("id, name")
        .eq("project_id", newProjectId);
        
      const stageMapping: Record<string, string> = {};
      
      if (originalStageIds && newStageIds) {
        originalStageIds.forEach(oldStage => {
          const matchingNewStage = newStageIds.find(s => s.name === oldStage.name);
          if (matchingNewStage) {
            stageMapping[oldStage.id] = matchingNewStage.id;
          }
        });
      }
      
      return stageMapping;
    } catch (error) {
      console.error("Error creating stage mapping:", error);
      return {};
    }
  };

  const copyTaskBatch = async (tasks: any[], newProjectId: string, stageMapping: Record<string, string>) => {
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
        category: task.category,
      }));

      const { error } = await supabase
        .from("tasks")
        .insert(newTasks);

      if (error) {
        console.error("Error copying tasks:", error);
        throw new Error(`فشل في نسخ المهام: ${error.message}`);
      }
    } catch (error) {
      console.error("Error in copyTaskBatch:", error);
      throw new Error(`فشل في نسخ مجموعة المهام: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    }
  };

  const copyAttachments = async (originalTasks: any[], newProjectId: string) => {
    updateProgress(80, "جاري البحث عن مرفقات للنسخ...");
    
    try {
      const { data: newTasks, error: newTasksError } = await supabase
        .from("tasks")
        .select("id, title")
        .eq("project_id", newProjectId);
        
      if (newTasksError) throw new Error("فشل في جلب المهام الجديدة لنسخ المرفقات");
      
      // Create a mapping from task title to new task ID
      const taskMapping: Record<string, string> = {};
      if (newTasks) {
        newTasks.forEach(newTask => {
          taskMapping[newTask.title] = newTask.id;
        });
      }
      
      let attachmentCount = 0;
      
      for (const originalTask of originalTasks) {
        const newTaskId = taskMapping[originalTask.title];
        if (!newTaskId) continue;
        
        // Copy attachments
        await copyTaskAttachments(originalTask.id, newTaskId, attachmentCount);
        
        // Copy templates
        await copyTaskTemplates(originalTask.id, newTaskId);
      }
      
      updateProgress(95, `تم نسخ المرفقات بنجاح`);
    } catch (error) {
      console.error("Error in copyAttachments:", error);
      // Continue the process but notify the user
      toast.error("تعذر نسخ بعض المرفقات، لكن تم نسخ المهام بنجاح");
    }
  };

  const copyTaskAttachments = async (originalTaskId: string, newTaskId: string, attachmentCount: number) => {
    try {
      const { data: attachments } = await supabase
        .from("unified_task_attachments")
        .select("*")
        .eq("task_id", originalTaskId)
        .eq("task_table", "tasks");
        
      if (attachments?.length > 0) {
        attachmentCount += attachments.length;
        
        const newAttachments = attachments.map(att => ({
          task_id: newTaskId,
          file_url: att.file_url,
          file_name: att.file_name,
          file_type: att.file_type,
          attachment_category: att.attachment_category,
          task_table: "tasks"
        }));
        
        const { error: attachError } = await supabase
          .from("unified_task_attachments")
          .insert(newAttachments);
          
        if (attachError) {
          console.error("Error copying attachments:", attachError);
        }
      }
    } catch (error) {
      console.error("Error copying task attachments:", error);
    }
  };

  const copyTaskTemplates = async (originalTaskId: string, newTaskId: string) => {
    try {
      const { data: templates } = await supabase
        .from("task_templates")
        .select("*")
        .eq("task_id", originalTaskId)
        .eq("task_table", "tasks");
        
      if (templates?.length > 0) {
        const newTemplates = templates.map(tmpl => ({
          task_id: newTaskId,
          file_url: tmpl.file_url,
          file_name: tmpl.file_name,
          file_type: tmpl.file_type,
          task_table: "tasks"
        }));
        
        const { error: templateError } = await supabase
          .from("task_templates")
          .insert(newTemplates);
          
        if (templateError) {
          console.error("Error copying templates:", templateError);
        }
      }
    } catch (error) {
      console.error("Error copying task templates:", error);
    }
  };

  return {
    ...state,
    handleCopy,
    resetState,
    updateProgress
  };
};
