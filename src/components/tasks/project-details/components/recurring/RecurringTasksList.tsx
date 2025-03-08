import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { RecurringTaskCard } from "./RecurringTaskCard";
import { Plus } from "lucide-react";
import { RecurringTaskDialog } from "./RecurringTaskDialog";
import { Task } from "../../types/task";
import { ProjectMember } from "../../types/projectMember";

interface RecurringTasksListProps {
  projectId: string;
  projectMembers: ProjectMember[];
}

export const RecurringTasksList: React.FC<RecurringTasksListProps> = ({ projectId, projectMembers }) => {
  const [recurringTasks, setRecurringTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecurringTasks = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', projectId)
          .not('recurring_type', 'is', null);

        if (error) {
          console.error("Error fetching recurring tasks:", error);
        } else {
          setRecurringTasks(data || []);
        }
      } catch (error) {
        console.error("Error fetching recurring tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecurringTasks();
  }, [projectId]);

  const handleTaskCreated = () => {
    // Refresh tasks after creating a new one
    fetchRecurringTasks();
  };

  const fetchRecurringTasks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .not('recurring_type', 'is', null);

      if (error) {
        console.error("Error fetching recurring tasks:", error);
      } else {
        setRecurringTasks(data || []);
      }
    } catch (error) {
      console.error("Error fetching recurring tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">المهام المتكررة</h3>
        <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          إضافة مهمة متكررة
        </Button>
      </div>

      {isLoading ? (
        <p>جاري تحميل المهام المتكررة...</p>
      ) : recurringTasks.length === 0 ? (
        <p>لا توجد مهام متكررة.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recurringTasks.map(task => (
            <RecurringTaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      <RecurringTaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        projectId={projectId}
        projectMembers={projectMembers}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
};
