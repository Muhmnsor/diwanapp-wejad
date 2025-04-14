import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// إضافة الاستيرادات في الأعلى
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

// تعديل الواجهة Props
interface TasksHeaderProps {
  onAddTask: () => void;
  isGeneral?: boolean;
  hideAddButton?: boolean;
  hideTitle?: boolean;
  projectId: string; // إضافة projectId
}

export const TasksHeader = ({ onAddTask, isGeneral, hideAddButton, hideTitle, projectId }: TasksHeaderProps) => {
  const { user } = useAuthStore();
  const [canAddTask, setCanAddTask] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      if (!projectId || !user) return;

      const { data: projectData } = await supabase
        .from('project_tasks')
        .select('project_manager')
        .eq('id', projectId)
        .single();

      setCanAddTask(
        user.role === 'admin' || 
        user.role === 'مدير ادارة' ||
        user.role === 'developer' ||
        (projectData && projectData.project_manager === user.id)
      );
    };

    checkPermissions();
  }, [projectId, user]);

  // تعديل عرض الزر
  return (
    <div className="flex justify-between items-center">
      {!hideTitle && <h2 className="text-xl font-bold">{isGeneral ? "المهام العامة" : "المهام"}</h2>}
      {!hideAddButton && canAddTask && (
        <Button 
          size="sm" 
          className="gap-1"
          onClick={onAddTask}
        >
          <Plus className="h-4 w-4" /> إضافة مهمة {isGeneral ? "عامة" : ""}
        </Button>
      )}
    </div>
  );
};
