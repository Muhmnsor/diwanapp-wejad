
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CopyProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
  onSuccess: () => void;
}

export const CopyProjectDialog = ({
  open,
  onOpenChange,
  projectId,
  projectTitle,
  onSuccess,
}: CopyProjectDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [newTitle, setNewTitle] = useState(`نسخة من ${projectTitle}`);
  const [includeTasks, setIncludeTasks] = useState(true);
  const [includeAttachments, setIncludeAttachments] = useState(true);
  const [includeStages, setIncludeStages] = useState(true);
  const [copyProgress, setCopyProgress] = useState(0);
  const [copyStep, setCopyStep] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newProjectId, setNewProjectId] = useState<string | null>(null);

  const resetState = () => {
    setCopyProgress(0);
    setCopyStep("");
    setIsComplete(false);
    setError(null);
    setNewProjectId(null);
  };

  const updateProgress = (progress: number, step: string) => {
    setCopyProgress(progress);
    setCopyStep(step);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    // Prevent event propagation to stop dialog from closing or navigating
    e.preventDefault();
    e.stopPropagation();
    
    // Reset previous state
    resetState();
    
    if (!newTitle.trim()) {
      toast.error("يرجى إدخال عنوان للمشروع الجديد");
      return;
    }

    setIsLoading(true);
    updateProgress(0, "جاري إعداد النسخة...");
    
    try {
      // Step 1: Fetch the original project
      updateProgress(10, "جاري جلب بيانات المشروع الأصلي...");
      
      const { data: originalProject, error: projectError } = await supabase
        .from("project_tasks")
        .select("*")
        .eq("id", projectId)
        .single();

      if (projectError) {
        console.error("Error fetching original project:", projectError);
        throw new Error("فشل في جلب بيانات المشروع الأصلي");
      }

      // Step 2: Create the new project
      updateProgress(20, "إنشاء المشروع الجديد...");
      
      const { data: newProject, error: createError } = await supabase
        .from("project_tasks")
        .insert([
          {
            title: newTitle,
            description: originalProject.description,
            status: "pending",
            workspace_id: originalProject.workspace_id,
            project_id: originalProject.project_id,
            due_date: originalProject.due_date,
            copied_from: projectId,
            is_draft: true, // Always create as draft
            project_manager: originalProject.project_manager,
            start_date: originalProject.start_date
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error("Error creating new project:", createError);
        throw new Error("فشل في إنشاء المشروع الجديد");
      }

      // Save new project ID for later use
      setNewProjectId(newProject.id);

      // Step 3: Copy project stages if enabled
      if (includeStages) {
        updateProgress(30, "جاري نسخ مراحل المشروع...");
        
        const { data: originalStages, error: stagesError } = await supabase
          .from("project_stages")
          .select("*")
          .eq("project_id", projectId);
          
        if (stagesError) {
          console.error("Error fetching original stages:", stagesError);
          throw new Error("فشل في جلب مراحل المشروع الأصلي");
        }
        
        if (originalStages && originalStages.length > 0) {
          updateProgress(35, `جاري نسخ ${originalStages.length} مرحلة...`);
          
          const newStages = originalStages.map(stage => ({
            name: stage.name,
            project_id: newProject.id,
            color: stage.color
          }));
          
          const { error: insertStagesError } = await supabase
            .from("project_stages")
            .insert(newStages);
            
          if (insertStagesError) {
            console.error("Error inserting stages:", insertStagesError);
            throw new Error("فشل في نسخ مراحل المشروع");
          }
          
          updateProgress(40, "تم نسخ مراحل المشروع بنجاح");
        } else {
          updateProgress(40, "لا توجد مراحل للنسخ");
        }
      } else {
        updateProgress(40, "تم تخطي نسخ المراحل");
      }

      if (includeTasks) {
        // Step 4: Fetch all tasks from the original project
        updateProgress(45, "جاري جلب المهام من المشروع الأصلي...");
        
        const { data: originalTasks, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .eq("project_id", projectId);

        if (tasksError) {
          console.error("Error fetching original tasks:", tasksError);
          throw new Error("فشل في جلب مهام المشروع الأصلي");
        }

        if (originalTasks && originalTasks.length > 0) {
          updateProgress(50, `تم العثور على ${originalTasks.length} مهمة للنسخ...`);
          
          // Step 5: If using stages, get the mapping between old and new stages
          let stageMapping = {};
          
          if (includeStages) {
            updateProgress(55, "جاري إعداد مراحل المهام...");
            
            const { data: originalStageIds } = await supabase
              .from("project_stages")
              .select("id, name")
              .eq("project_id", projectId);
              
            const { data: newStageIds } = await supabase
              .from("project_stages")
              .select("id, name")
              .eq("project_id", newProject.id);
              
            if (originalStageIds && newStageIds) {
              // Create a mapping from old stage name to new stage id
              originalStageIds.forEach(oldStage => {
                const matchingNewStage = newStageIds.find(s => s.name === oldStage.name);
                if (matchingNewStage) {
                  stageMapping[oldStage.id] = matchingNewStage.id;
                }
              });
            }
          }
          
          // Step 6: Create tasks in the new project - process in batches to avoid timeouts
          const BATCH_SIZE = 10;
          const totalBatches = Math.ceil(originalTasks.length / BATCH_SIZE);
          
          for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
            const start = batchIndex * BATCH_SIZE;
            const end = Math.min(start + BATCH_SIZE, originalTasks.length);
            const currentBatch = originalTasks.slice(start, end);
            
            const progressPercent = 60 + (batchIndex / totalBatches) * 15;
            updateProgress(
              progressPercent, 
              `جاري نسخ المهام (${start + 1} إلى ${end} من ${originalTasks.length})...`
            );
            
            const newTasksBatch = currentBatch.map((task) => ({
              title: task.title,
              description: task.description,
              status: "draft", // Start as draft
              priority: task.priority,
              assigned_to: task.assigned_to, // Keep the same assignees
              project_id: newProject.id,
              workspace_id: task.workspace_id,
              stage_id: includeStages && task.stage_id ? stageMapping[task.stage_id] || null : null,
              due_date: task.due_date,
              category: task.category,
            }));

            const { error: insertTasksError } = await supabase
              .from("tasks")
              .insert(newTasksBatch);

            if (insertTasksError) {
              console.error(`Error inserting tasks batch ${batchIndex + 1}:`, insertTasksError);
              throw new Error(`فشل في نسخ المهام - الدفعة ${batchIndex + 1}`);
            }
            
            // Short delay to prevent rate limiting
            await new Promise(resolve => setTimeout(resolve, 300));
          }
          
          updateProgress(75, "تم نسخ المهام بنجاح");
          
          // Step 7: Copy attachments if needed - this step is more intensive
          if (includeAttachments) {
            updateProgress(80, "جاري البحث عن مرفقات للنسخ...");
            
            // Find the tasks in the new project that match the original tasks
            const { data: newTasks, error: newTasksError } = await supabase
              .from("tasks")
              .select("id, title")
              .eq("project_id", newProject.id);
              
            if (newTasksError) {
              console.error("Error fetching new tasks for attachments:", newTasksError);
              throw new Error("فشل في جلب المهام الجديدة لنسخ المرفقات");
            }
            
            // Create a mapping of original task titles to new task IDs
            const taskMapping = {};
            newTasks.forEach(newTask => {
              taskMapping[newTask.title] = newTask.id;
            });
            
            // Process attachments in batches for each original task that has attachments
            let attachmentCount = 0;
            let processingProgress = 0;
            let taskProcessed = 0;
            
            for (const originalTask of originalTasks) {
              processingProgress = Math.floor((taskProcessed / originalTasks.length) * 15) + 80;
              taskProcessed++;
              
              const newTaskId = taskMapping[originalTask.title];
              if (!newTaskId) continue;
              
              // Get attachments for this task
              const { data: attachments } = await supabase
                .from("unified_task_attachments")
                .select("*")
                .eq("task_id", originalTask.id)
                .eq("task_table", "tasks");
                
              if (attachments && attachments.length > 0) {
                attachmentCount += attachments.length;
                updateProgress(
                  processingProgress,
                  `جاري نسخ المرفقات (${attachmentCount} مرفق حتى الآن)...`
                );
                
                const newAttachments = attachments.map(att => ({
                  task_id: newTaskId,
                  file_url: att.file_url,
                  file_name: att.file_name,
                  file_type: att.file_type,
                  attachment_category: att.attachment_category,
                  task_table: "tasks"
                }));
                
                // Insert attachments for this task
                const { error: attachError } = await supabase
                  .from("unified_task_attachments")
                  .insert(newAttachments);
                  
                if (attachError) {
                  console.error("Error copying attachments:", attachError);
                  // Continue with next task even if one fails
                }
                
                // Short delay to prevent rate limiting
                await new Promise(resolve => setTimeout(resolve, 200));
              }
              
              // Check for templates as well
              const { data: templates } = await supabase
                .from("task_templates")
                .select("*")
                .eq("task_id", originalTask.id)
                .eq("task_table", "tasks");
                
              if (templates && templates.length > 0) {
                updateProgress(
                  processingProgress,
                  `جاري نسخ قوالب المهام...`
                );
                
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
                  // Continue with next task even if one fails
                }
              }
            }
            
            updateProgress(95, `تم نسخ ${attachmentCount} مرفق بنجاح`);
          } else {
            updateProgress(95, "تم تخطي نسخ المرفقات والقوالب");
          }
        } else {
          updateProgress(95, "لا توجد مهام للنسخ");
        }
      } else {
        updateProgress(95, "تم تخطي نسخ المهام");
      }

      // Set to complete status
      updateProgress(100, "تم نسخ المشروع بنجاح!");
      setIsComplete(true);
      
      toast.success("تم نسخ المشروع بنجاح");
      
      // Short delay to show 100% progress before closing dialog and navigating
      setTimeout(() => {
        // First close the dialog without navigation
        onOpenChange(false);
        
        // Then call onSuccess (which might include navigation)
        // Use a slight delay to ensure dialog is closed first
        setTimeout(() => {
          // Reset state for next time
          setIsComplete(false);
          setCopyProgress(0);
          setCopyStep("");
          setIsLoading(false);
          
          // Call success callback with new project ID
          onSuccess();
        }, 100);
      }, 1500);
      
    } catch (error) {
      console.error("Error copying project:", error);
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء نسخ المشروع";
      setError(errorMessage);
      toast.error(errorMessage);
      setCopyStep("حدث خطأ أثناء نسخ المشروع");
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      resetState();
      onOpenChange(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setNewTitle(e.target.value);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={handleClose}
    >
      <DialogContent 
        className="sm:max-w-[425px]" 
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>نسخ المشروع كمسودة</DialogTitle>
          <DialogDescription>
            سيتم إنشاء نسخة جديدة من المشروع بوضع المسودة حتى تتمكن من تعديلها قبل إطلاقها.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="py-4 space-y-4">
            <div className="text-center text-sm font-medium text-blue-600">{copyStep}</div>
            <Progress value={copyProgress} className="h-2" />
          </div>
        )}

        {!isLoading && (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="projectTitle">عنوان المشروع الجديد</Label>
              <Input
                id="projectTitle"
                value={newTitle}
                onChange={handleTitleChange}
                onFocus={(e) => e.stopPropagation()}
                onBlur={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="includeStages"
                checked={includeStages}
                onCheckedChange={() => setIncludeStages(!includeStages)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="includeStages" className="mr-2 cursor-pointer">نسخ مراحل المشروع</Label>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="includeTasks"
                checked={includeTasks}
                onCheckedChange={() => setIncludeTasks(!includeTasks)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="includeTasks" className="mr-2 cursor-pointer">نسخ جميع المهام</Label>
            </div>

            {includeTasks && (
              <div className="flex items-center space-x-2 space-x-reverse mr-6">
                <Checkbox
                  id="includeAttachments"
                  checked={includeAttachments}
                  onCheckedChange={() => setIncludeAttachments(!includeAttachments)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="includeAttachments" className="mr-2 cursor-pointer">نسخ المرفقات والقوالب</Label>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex-row-reverse gap-2">
          <Button 
            onClick={handleCopy} 
            disabled={isLoading}
            className={isComplete ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isComplete ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" /> تم النسخ بنجاح
              </>
            ) : isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> جاري النسخ...
              </>
            ) : (
              "نسخ المشروع"
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isLoading}
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
