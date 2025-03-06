
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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
  const [title, setTitle] = useState(`نسخة من ${projectTitle}`);
  const [copyTasks, setCopyTasks] = useState(true);
  const [copySubtasks, setCopySubtasks] = useState(true);
  const [copyAttachments, setCopyAttachments] = useState(false);
  const [targetWorkspaceId, setTargetWorkspaceId] = useState<string>("");
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Fetch workspaces for dropdown
  useEffect(() => {
    const fetchWorkspaces = async () => {
      setIsFetching(true);
      try {
        const { data, error } = await supabase
          .from("workspaces")
          .select("id, name")
          .eq("status", "active")
          .order("name");

        if (error) throw error;
        setWorkspaces(data || []);
        
        // Get the current project's workspace ID
        const { data: projectData, error: projectError } = await supabase
          .from("project_tasks")
          .select("workspace_id")
          .eq("id", projectId)
          .single();
          
        if (!projectError && projectData) {
          setTargetWorkspaceId(projectData.workspace_id);
        }
      } catch (error) {
        console.error("Error fetching workspaces:", error);
        toast.error("حدث خطأ أثناء تحميل مساحات العمل");
      } finally {
        setIsFetching(false);
      }
    };

    if (open) {
      fetchWorkspaces();
      setTitle(`نسخة من ${projectTitle}`);
    }
  }, [open, projectId, projectTitle]);

  const handleCopy = async () => {
    if (!title.trim()) {
      toast.error("يرجى إدخال عنوان للمشروع");
      return;
    }

    if (!targetWorkspaceId) {
      toast.error("يرجى اختيار مساحة العمل");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Get the project details
      const { data: projectData, error: projectError } = await supabase
        .from("project_tasks")
        .select("*")
        .eq("id", projectId)
        .single();

      if (projectError) throw projectError;

      // 2. Create a new project as a draft
      const { data: newProject, error: createError } = await supabase
        .from("project_tasks")
        .insert([
          {
            title: title,
            description: projectData.description,
            status: "pending",
            workspace_id: targetWorkspaceId,
            due_date: projectData.due_date,
            start_date: projectData.start_date,
            priority: projectData.priority,
            is_draft: true,
            copied_from: projectId,
          },
        ])
        .select()
        .single();

      if (createError) throw createError;

      if (copyTasks) {
        // 3. Copy tasks
        const { data: tasks, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .eq("project_id", projectId);

        if (tasksError) throw tasksError;

        // Create a mapping of old task IDs to new task IDs
        const taskIdMap: Record<string, string> = {};

        for (const task of tasks || []) {
          const { data: newTask, error: newTaskError } = await supabase
            .from("tasks")
            .insert([
              {
                title: task.title,
                description: task.description,
                status: "draft", // Start in draft status
                priority: task.priority,
                due_date: task.due_date,
                project_id: newProject.id,
                workspace_id: targetWorkspaceId,
                stage_id: task.stage_id,
                category: task.category,
              },
            ])
            .select()
            .single();

          if (newTaskError) throw newTaskError;
          taskIdMap[task.id] = newTask.id;

          if (copySubtasks) {
            // 4. Copy subtasks for this task
            const { data: subtasks, error: subtasksError } = await supabase
              .from("subtasks")
              .select("*")
              .eq("task_id", task.id);

            if (subtasksError) throw subtasksError;

            for (const subtask of subtasks || []) {
              await supabase.from("subtasks").insert([
                {
                  task_id: newTask.id,
                  title: subtask.title,
                  status: "pending",
                  due_date: subtask.due_date,
                },
              ]);
            }
          }

          if (copyAttachments) {
            // 5. Copy task attachments
            const { data: attachments, error: attachmentsError } = await supabase
              .from("task_attachments")
              .select("*")
              .eq("task_id", task.id);

            if (attachmentsError) throw attachmentsError;

            for (const attachment of attachments || []) {
              await supabase.from("task_attachments").insert([
                {
                  task_id: newTask.id,
                  file_name: attachment.file_name,
                  file_url: attachment.file_url,
                  file_type: attachment.file_type,
                  content_type: attachment.content_type,
                  attachment_category: attachment.attachment_category,
                },
              ]);
            }
          }
        }

        // 6. Copy project stages
        const { data: stages, error: stagesError } = await supabase
          .from("project_stages")
          .select("*")
          .eq("project_id", projectId);

        if (stagesError) throw stagesError;

        for (const stage of stages || []) {
          await supabase.from("project_stages").insert([
            {
              project_id: newProject.id,
              name: stage.name,
            },
          ]);
        }
      }

      toast.success("تم نسخ المشروع بنجاح");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error copying project:", error);
      toast.error("حدث خطأ أثناء نسخ المشروع");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>نسخ المشروع</DialogTitle>
          <DialogDescription>
            قم بإنشاء نسخة من المشروع مع إمكانية تعديل خصائصه
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان المشروع الجديد</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="أدخل عنوان المشروع"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workspace">مساحة العمل</Label>
            <Select
              value={targetWorkspaceId}
              onValueChange={setTargetWorkspaceId}
              disabled={isFetching}
            >
              <SelectTrigger id="workspace">
                <SelectValue placeholder="اختر مساحة العمل" />
              </SelectTrigger>
              <SelectContent>
                {workspaces.map((workspace) => (
                  <SelectItem key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="copy-tasks"
                checked={copyTasks}
                onCheckedChange={(checked) => {
                  const isChecked = checked === true;
                  setCopyTasks(isChecked);
                  if (!isChecked) {
                    setCopySubtasks(false);
                    setCopyAttachments(false);
                  }
                }}
              />
              <Label htmlFor="copy-tasks" className="mr-2">
                نسخ المهام
              </Label>
            </div>

            {copyTasks && (
              <>
                <div className="flex items-center space-x-2 space-x-reverse mr-6">
                  <Checkbox
                    id="copy-subtasks"
                    checked={copySubtasks}
                    onCheckedChange={(checked) => setCopySubtasks(checked === true)}
                  />
                  <Label htmlFor="copy-subtasks" className="mr-2">
                    نسخ المهام الفرعية
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse mr-6">
                  <Checkbox
                    id="copy-attachments"
                    checked={copyAttachments}
                    onCheckedChange={(checked) => setCopyAttachments(checked === true)}
                  />
                  <Label htmlFor="copy-attachments" className="mr-2">
                    نسخ المرفقات
                  </Label>
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter className="flex-row-reverse gap-2">
          <Button onClick={handleCopy} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> جاري النسخ...
              </>
            ) : (
              "نسخ المشروع"
            )}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
