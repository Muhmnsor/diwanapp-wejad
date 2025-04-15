import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// تعديل الاستيراد
import { useAuthStore } from "@/store/refactored-auth";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

// تعديل الواجهة Props
interface TasksHeaderProps {
  onAddTask: () => void;
  isGeneral?: boolean;
  hideAddButton?: boolean;
  hideTitle?: boolean;
  projectId?: string; // projectId أصبح اختياريًا
}

export const TasksHeader = ({
  onAddTask,
  isGeneral,
  hideAddButton,
  hideTitle,
  projectId
}: TasksHeaderProps) => {
  const { user } = useAuthStore();
  const [canAddTask, setCanAddTask] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      if (!user) return;

      // إذا كان Admin أو له صلاحيات عامة
      if (
        user.role === "admin" ||
        user.role === "مدير ادارة" ||
        user.role === "developer" ||
        user.isAdmin
      ) {
        setCanAddTask(true);
        return;
      }

      // التحقق من كونه مدير المشروع إن وُجد projectId
      if (projectId) {
        const { data: projectData } = await supabase
          .from("project_tasks")
          .select("project_manager")
          .eq("id", projectId)
          .single();

        if (projectData?.project_manager === user.id) {
          setCanAddTask(true);
        }
      }
    };

    checkPermissions();
  }, [projectId, user]);

  return (
    <div className="flex justify-between items-center">
      {!hideTitle && (
        <h2 className="text-xl font-bold">
          {isGeneral ? "المهام العامة" : "المهام"}
        </h2>
      )}
      {!hideAddButton && canAddTask && (
        <Button onClick={onAddTask} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة مهمة {isGeneral ? "عامة" : ""}
        </Button>
      )}
    </div>
  );
};
