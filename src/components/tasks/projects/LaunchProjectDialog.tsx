
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface TaskSummary {
  total: number;
  withAssignees: number;
  withDueDates: number;
  assignees: { id: string; name: string; count: number }[];
}

interface LaunchProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
  onSuccess: () => void;
}

export const LaunchProjectDialog = ({
  open,
  onOpenChange,
  projectId,
  projectTitle,
  onSuccess,
}: LaunchProjectDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [taskSummary, setTaskSummary] = useState<TaskSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // Load task summary when dialog opens
  useEffect(() => {
    if (open && projectId) {
      fetchTaskSummary();
    }
  }, [open, projectId]);

  const fetchTaskSummary = async () => {
    setIsLoadingSummary(true);
    try {
      // Fetch tasks for this project
      const { data: tasks, error: tasksError } = await supabase
        .from("tasks")
        .select("id, title, assigned_to, due_date")
        .eq("project_id", projectId);

      if (tasksError) throw tasksError;

      const totalTasks = tasks?.length || 0;
      const withAssignees = tasks?.filter(t => t.assigned_to)?.length || 0;
      const withDueDates = tasks?.filter(t => t.due_date)?.length || 0;

      // Count tasks per assignee
      const assigneeCounts: Record<string, number> = {};
      const assigneeIds: string[] = [];

      tasks?.forEach(task => {
        if (task.assigned_to) {
          if (!assigneeCounts[task.assigned_to]) {
            assigneeCounts[task.assigned_to] = 0;
            assigneeIds.push(task.assigned_to);
          }
          assigneeCounts[task.assigned_to]++;
        }
      });

      // Get assignee names
      const assignees: { id: string; name: string; count: number }[] = [];
      
      if (assigneeIds.length > 0) {
        for (const assigneeId of assigneeIds) {
          // Check if it's a custom assignee
          if (assigneeId.startsWith('custom:')) {
            assignees.push({
              id: assigneeId,
              name: assigneeId.replace('custom:', ''),
              count: assigneeCounts[assigneeId]
            });
          } else {
            // Fetch user profile
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('display_name, email')
              .eq('id', assigneeId)
              .single();
              
            if (!profileError && profile) {
              assignees.push({
                id: assigneeId,
                name: profile.display_name || profile.email || 'مستخدم',
                count: assigneeCounts[assigneeId]
              });
            }
          }
        }
      }

      setTaskSummary({
        total: totalTasks,
        withAssignees,
        withDueDates,
        assignees
      });
    } catch (error) {
      console.error("Error fetching task summary:", error);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleLaunch = async () => {
    setIsLoading(true);
    try {
      // 1. Update project status from draft to active
      const { error: projectError } = await supabase
        .from("project_tasks")
        .update({ is_draft: false, status: "in_progress" })
        .eq("id", projectId);

      if (projectError) throw projectError;

      // 2. Update all tasks from draft to pending
      const { error: tasksError } = await supabase
        .from("tasks")
        .update({ status: "pending" })
        .eq("project_id", projectId)
        .eq("status", "draft");

      if (tasksError) throw tasksError;

      // 3. Send notifications to assigned users
      const { data: tasks, error: fetchError } = await supabase
        .from("tasks")
        .select("id, title, assigned_to")
        .eq("project_id", projectId)
        .not("assigned_to", "is", null);

      if (fetchError) throw fetchError;

      // Send notifications for each assigned task
      for (const task of tasks || []) {
        if (task.assigned_to) {
          await supabase.from("in_app_notifications").insert([
            {
              user_id: task.assigned_to,
              title: "تم إسناد مهمة جديدة إليك",
              message: `تم إسناد مهمة "${task.title}" إليك في مشروع "${projectTitle}"`,
              notification_type: "task_assignment",
              related_entity_id: task.id,
              related_entity_type: "task",
            },
          ]);
        }
      }

      toast.success("تم إطلاق المشروع بنجاح");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error launching project:", error);
      toast.error("حدث خطأ أثناء إطلاق المشروع");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إطلاق المشروع</DialogTitle>
          <DialogDescription>
            عند إطلاق المشروع، سيتم إرسال إشعارات للمكلفين بالمهام وستصبح المهام نشطة للعمل عليها.
          </DialogDescription>
        </DialogHeader>

        {isLoadingSummary ? (
          <div className="py-4 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : taskSummary ? (
          <div className="space-y-4 my-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">ملخص المهام</h3>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="bg-white p-2 rounded border border-blue-100 text-center">
                  <div className="text-lg font-bold text-blue-700">{taskSummary.total}</div>
                  <div className="text-xs text-blue-800">إجمالي المهام</div>
                </div>
                <div className="bg-white p-2 rounded border border-blue-100 text-center">
                  <div className="text-lg font-bold text-blue-700">{taskSummary.withAssignees}</div>
                  <div className="text-xs text-blue-800">مهام مسندة</div>
                </div>
                <div className="bg-white p-2 rounded border border-blue-100 text-center">
                  <div className="text-lg font-bold text-blue-700">{taskSummary.withDueDates}</div>
                  <div className="text-xs text-blue-800">مهام بتاريخ</div>
                </div>
              </div>
            </div>

            {taskSummary.assignees.length > 0 && (
              <div className="border rounded-md overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b text-sm font-medium">
                  المكلفون بالمهام
                </div>
                <div className="divide-y">
                  {taskSummary.assignees.map((assignee) => (
                    <div key={assignee.id} className="px-4 py-2 flex justify-between items-center">
                      <div className="text-sm">{assignee.name}</div>
                      <div className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                        {assignee.count} {assignee.count === 1 ? 'مهمة' : 'مهام'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 my-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 ml-2" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">تنبيه هام</h3>
              <p className="text-xs text-yellow-700 mt-1">
                بعد إطلاق المشروع، سيتم تفعيل جميع المهام وإرسال الإشعارات للمكلفين. تأكد من مراجعة جميع تفاصيل المشروع والمهام قبل الإطلاق.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row-reverse gap-2">
          <Button onClick={handleLaunch} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> جاري الإطلاق...
              </>
            ) : (
              "إطلاق المشروع"
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
