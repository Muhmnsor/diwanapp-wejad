
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
import { Loader2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useTaskAssignmentNotifications } from "@/hooks/useTaskAssignmentNotifications";
import { useAuthStore } from "@/store/authStore";
import { useNotificationQueue } from "@/hooks/useNotificationQueue";
import { Progress } from "@/components/ui/progress";

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
  const [launchProgress, setLaunchProgress] = useState(0);
  const [launchStep, setLaunchStep] = useState("");
  const { sendProjectLaunchNotification } = useTaskAssignmentNotifications();
  const { user } = useAuthStore();
  const { queueMultipleNotifications } = useNotificationQueue();

  useEffect(() => {
    if (open && projectId) {
      fetchTaskSummary();
    }
  }, [open, projectId]);

  const fetchTaskSummary = async () => {
    setIsLoadingSummary(true);
    try {
      setLaunchStep("جاري جلب تفاصيل المهام...");
      const { data: tasks, error: tasksError } = await supabase
        .from("tasks")
        .select("id, title, assigned_to, due_date")
        .eq("project_id", projectId);

      if (tasksError) throw tasksError;

      const totalTasks = tasks?.length || 0;
      const withAssignees = tasks?.filter(t => t.assigned_to)?.length || 0;
      const withDueDates = tasks?.filter(t => t.due_date)?.length || 0;

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

      const assignees: { id: string; name: string; count: number }[] = [];
      
      if (assigneeIds.length > 0) {
        setLaunchStep("جاري جلب معلومات المكلفين...");
        for (const assigneeId of assigneeIds) {
          if (assigneeId.startsWith('custom:')) {
            assignees.push({
              id: assigneeId,
              name: assigneeId.replace('custom:', ''),
              count: assigneeCounts[assigneeId]
            });
          } else {
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
      toast.error("حدث خطأ أثناء جلب ملخص المهام");
    } finally {
      setIsLoadingSummary(false);
      setLaunchStep("");
    }
  };

  const handleLaunch = async () => {
    setIsLoading(true);
    setLaunchProgress(0);
    
    try {
      // Step 1: Update project status
      setLaunchStep("تحديث حالة المشروع...");
      setLaunchProgress(10);
      
      const { error: projectError } = await supabase
        .from("project_tasks")
        .update({ is_draft: false, status: "in_progress" })
        .eq("id", projectId);

      if (projectError) throw projectError;
      
      // Step 2: Update task statuses
      setLaunchStep("تحديث حالة المهام...");
      setLaunchProgress(30);
      
      const { error: tasksError } = await supabase
        .from("tasks")
        .update({ status: "pending" })
        .eq("project_id", projectId)
        .eq("status", "draft");

      if (tasksError) throw tasksError;
      
      // Step 3: Prepare notifications
      setLaunchStep("إعداد الإشعارات...");
      setLaunchProgress(50);
      
      const { data: tasks, error: fetchError } = await supabase
        .from("tasks")
        .select("id, title, assigned_to")
        .eq("project_id", projectId)
        .not("assigned_to", "is", null);

      if (fetchError) throw fetchError;

      const assigneeIds = new Set<string>();
      
      tasks?.forEach(task => {
        if (task.assigned_to && !task.assigned_to.startsWith('custom:')) {
          assigneeIds.add(task.assigned_to);
        }
      });

      // Step 4: Send project launch notification
      setLaunchStep("إرسال إشعارات إطلاق المشروع...");
      setLaunchProgress(70);
      
      if (assigneeIds.size > 0) {
        await sendProjectLaunchNotification(
          projectId,
          projectTitle,
          Array.from(assigneeIds)
        );
      }

      // Step 5: Send task assignment notifications
      setLaunchStep("إرسال إشعارات المهام...");
      setLaunchProgress(85);
      
      if (tasks && tasks.length > 0) {
        const notifications = tasks
          .filter(task => task.assigned_to && !task.assigned_to.startsWith('custom:'))
          .map(task => ({
            user_id: task.assigned_to,
            title: "تم إسناد مهمة جديدة إليك",
            message: `تم إسناد مهمة "${task.title}" إليك في مشروع "${projectTitle}"`,
            notification_type: "task_assignment" as any,
            related_entity_id: task.id,
            related_entity_type: "task",
            priority: 1
          }));
          
        if (notifications.length > 0) {
          await queueMultipleNotifications(notifications);
        }
      }

      setLaunchProgress(100);
      setLaunchStep("تم إطلاق المشروع بنجاح!");
      
      // Step 6: All done!
      toast.success("تم إطلاق المشروع بنجاح");
      
      // Short delay to show 100% progress
      setTimeout(() => {
        onSuccess();
        onOpenChange(false);
      }, 1000);
      
    } catch (error) {
      console.error("Error launching project:", error);
      toast.error("حدث خطأ أثناء إطلاق المشروع");
      setLaunchStep("حدث خطأ أثناء إطلاق المشروع");
    } finally {
      if (launchProgress < 100) {
        setLaunchProgress(0);
      }
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (isLoading) return; // Prevent closing during launch process
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إطلاق المشروع</DialogTitle>
          <DialogDescription>
            عند إطلاق المشروع، سيتم إرسال إشعارات للمكلفين بالمهام وستصبح المهام نشطة للعمل عليها.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="py-6 space-y-4">
            <div className="text-center text-sm font-medium text-blue-600">{launchStep}</div>
            <Progress value={launchProgress} className="h-2" />
          </div>
        )}

        {isLoadingSummary ? (
          <div className="py-4 space-y-4">
            <div className="text-center text-sm text-gray-500">{launchStep}</div>
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          </div>
        ) : taskSummary && !isLoading ? (
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
                <div className="divide-y max-h-60 overflow-y-auto">
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
          <Button 
            onClick={handleLaunch} 
            disabled={isLoading || isLoadingSummary}
            className={launchProgress === 100 ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {launchProgress === 100 ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" /> تم الإطلاق بنجاح
              </>
            ) : isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> جاري الإطلاق...
              </>
            ) : (
              "إطلاق المشروع"
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
