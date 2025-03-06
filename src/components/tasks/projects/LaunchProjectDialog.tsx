
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
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

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
