
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
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [copyProgress, setCopyProgress] = useState(0);
  const [copyStep, setCopyStep] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const handleCopy = async () => {
    if (!newTitle.trim()) {
      toast.error("يرجى إدخال عنوان للمشروع الجديد");
      return;
    }

    setIsLoading(true);
    setCopyProgress(0);
    setCopyStep("جاري إعداد النسخة...");
    
    try {
      // Step 1: Fetch the original project
      setCopyStep("جاري جلب بيانات المشروع الأصلي...");
      setCopyProgress(10);
      
      const { data: originalProject, error: projectError } = await supabase
        .from("project_tasks")
        .select("*")
        .eq("id", projectId)
        .single();

      if (projectError) throw projectError;

      // Step 2: Create the new project
      setCopyStep("إنشاء المشروع الجديد...");
      setCopyProgress(30);
      
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

      if (createError) throw createError;

      if (includeTasks) {
        // Step 3: Fetch all tasks from the original project
        setCopyStep("جاري جلب المهام من المشروع الأصلي...");
        setCopyProgress(50);
        
        const { data: originalTasks, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .eq("project_id", projectId);

        if (tasksError) throw tasksError;

        if (originalTasks && originalTasks.length > 0) {
          // Step 4: Create tasks in the new project
          setCopyStep("إنشاء المهام في المشروع الجديد...");
          setCopyProgress(70);
          
          const newTasks = originalTasks.map((task) => ({
            title: task.title,
            description: task.description,
            status: "draft", // Start as draft
            priority: task.priority,
            assigned_to: task.assigned_to, // Keep the same assignees
            project_id: newProject.id,
            workspace_id: task.workspace_id,
            stage_id: task.stage_id,
            due_date: task.due_date,
            category: task.category,
          }));

          const { error: insertTasksError } = await supabase
            .from("tasks")
            .insert(newTasks);

          if (insertTasksError) throw insertTasksError;
          
          // Step 5: Copy attachments and templates if needed
          if (includeAttachments && originalTasks.length > 0) {
            setCopyStep("نسخ المرفقات والقوالب...");
            setCopyProgress(85);
            
            for (const task of originalTasks) {
              // Find the corresponding new task
              const { data: newTask } = await supabase
                .from("tasks")
                .select("id")
                .eq("project_id", newProject.id)
                .eq("title", task.title)
                .single();
                
              if (newTask) {
                // Copy attachments
                const { data: attachments } = await supabase
                  .from("unified_task_attachments")
                  .select("*")
                  .eq("task_id", task.id)
                  .eq("task_table", "tasks");
                  
                if (attachments && attachments.length > 0) {
                  const newAttachments = attachments.map(att => ({
                    task_id: newTask.id,
                    file_url: att.file_url,
                    file_name: att.file_name,
                    file_type: att.file_type,
                    attachment_category: att.attachment_category,
                    task_table: "tasks"
                  }));
                  
                  await supabase
                    .from("unified_task_attachments")
                    .insert(newAttachments);
                }
                
                // Copy templates
                const { data: templates } = await supabase
                  .from("task_templates")
                  .select("*")
                  .eq("task_id", task.id)
                  .eq("task_table", "tasks");
                  
                if (templates && templates.length > 0) {
                  const newTemplates = templates.map(tmpl => ({
                    task_id: newTask.id,
                    file_url: tmpl.file_url,
                    file_name: tmpl.file_name,
                    file_type: tmpl.file_type,
                    task_table: "tasks"
                  }));
                  
                  await supabase
                    .from("task_templates")
                    .insert(newTemplates);
                }
              }
            }
          }
        }
      }

      setCopyProgress(100);
      setCopyStep("تم نسخ المشروع بنجاح!");
      setIsComplete(true);
      
      toast.success("تم نسخ المشروع بنجاح");
      
      // Short delay to show 100% progress
      setTimeout(() => {
        onSuccess();
        onOpenChange(false);
        // Reset state for next time
        setIsComplete(false);
        setCopyProgress(0);
        setCopyStep("");
      }, 1500);
      
    } catch (error) {
      console.error("Error copying project:", error);
      toast.error("حدث خطأ أثناء نسخ المشروع");
      setCopyStep("حدث خطأ أثناء نسخ المشروع");
      setCopyProgress(0);
    } finally {
      if (!isComplete) {
        setIsLoading(false);
      }
    }
  };

  const handleCheckboxChange = (e: React.MouseEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    // Stop event propagation to prevent dialog from closing
    e.stopPropagation();
    setter(prev => !prev);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (isLoading) return; // Prevent closing during copy process
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>نسخ المشروع كمسودة</DialogTitle>
          <DialogDescription>
            سيتم إنشاء نسخة جديدة من المشروع بوضع المسودة حتى تتمكن من تعديلها قبل إطلاقها.
          </DialogDescription>
        </DialogHeader>

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
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div className="flex items-center space-x-2 space-x-reverse" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                id="includeTasks"
                checked={includeTasks}
                onCheckedChange={() => setIncludeTasks(!includeTasks)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="includeTasks" className="mr-2 cursor-pointer">نسخ جميع المهام</Label>
            </div>

            {includeTasks && (
              <div className="flex items-center space-x-2 space-x-reverse mr-6" onClick={(e) => e.stopPropagation()}>
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
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
