import { useState } from "react";
import { ProjectTask } from "@/types/task";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, CheckCircle2, Circle, Clock } from "lucide-react";
import { SubtasksList } from "./SubtasksList";
import { SelectField } from "@/components/events/form/fields/SelectField";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TaskCardProps {
  task: ProjectTask;
}

export const TaskCard = ({ task }: TaskCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [status, setStatus] = useState(task.status);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({ status: newStatus })
        .eq('id', task.id);

      if (error) throw error;

      setStatus(newStatus);
      toast.success("تم تحديث حالة المهمة بنجاح");
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error("حدث خطأ أثناء تحديث حالة المهمة");
    }
  };

  const statusOptions = [
    { value: "pending", label: "قيد الانتظار" },
    { value: "in_progress", label: "قيد التنفيذ" },
    { value: "completed", label: "مكتمل" }
  ];

  return (
    <Card className="p-3">
      <div className="space-y-4">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            {getStatusIcon(status)}
            <span className="font-medium">{task.title}</span>
            <Badge variant="secondary" className={getStatusColor(status)}>
              {status}
            </Badge>
          </div>
          {task.task_subtasks?.length > 0 && (
            isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )
          )}
        </div>

        <div className="pr-8">
          <SelectField
            value={status}
            onChange={handleStatusChange}
            options={statusOptions}
            className="w-48"
          />
        </div>

        {task.description && (
          <p className="mt-2 text-sm text-gray-600">{task.description}</p>
        )}

        {isExpanded && task.task_subtasks && (
          <div className="mt-3 pr-4 border-r border-gray-200">
            <SubtasksList subtasks={task.task_subtasks} />
          </div>
        )}
      </div>
    </Card>
  );
};