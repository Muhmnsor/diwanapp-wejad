
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { copyProjectStages, createStageMapping } from "../services/copyProjectService";
import { copyTaskBatch, copyTaskAttachments, copyTaskTemplates } from "../services/copyTasksService";
import { CopyProjectState, UseCopyProjectProps } from "../types/copyProject";

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

  const copyProjectTasks = async (originalProjectId: string, newProjectId: string, includeAttachments: boolean) => {
    updateProgress(45, "جاري جلب المهام من المشروع الأصلي...");
    
    try {
      const { data: originalTasks, error: tasksError } = await supabase
        .from("project_tasks")
        .select("*")
        .eq("project_id", originalProjectId);

      if (tasksError) throw new Error("فشل في جلب مهام المشروع الأصلي");

      if (originalTasks?.length > 0) {
        const BATCH_SIZE = 10;
        const totalBatches = Math.ceil(originalTasks.length / BATCH_SIZE);
        
        let stageMapping: Record<string, string> = {};
        if (includeStages) {
          stageMapping = await createStageMapping(originalProjectId, newProjectId);
        }

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
            for (const task of currentBatch) {
              await copyTaskAttachments(task.id, newProjectId);
              await copyTaskTemplates(task.id, newProjectId);
            }
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
        updateProgress(30, "جاري نسخ مراحل المشروع...");
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

  return {
    ...state,
    handleCopy,
    resetState,
    updateProgress
  };
};
