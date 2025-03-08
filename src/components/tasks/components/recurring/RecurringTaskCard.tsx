
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Check, Clock, Pause, Play, Trash } from "lucide-react";
import { TaskPriorityBadge } from "../../components/priority/TaskPriorityBadge";
import { formatDate } from "@/utils/dateUtils";
import { RecurringTask } from "../../types/RecurringTask";

interface RecurringTaskCardProps {
  task: RecurringTask;
  onToggleStatus: (taskId: string, isActive: boolean) => void;
  onDelete: (taskId: string) => void;
}

export const RecurringTaskCard: React.FC<RecurringTaskCardProps> = ({ 
  task, 
  onToggleStatus, 
  onDelete 
}) => {
  const renderRecurrence = (task: RecurringTask) => {
    if (task.recurrence_type === 'monthly' && task.day_of_month) {
      return `شهرياً - يوم ${task.day_of_month} من كل شهر`;
    } 
    if (task.recurrence_type === 'weekly' && task.day_of_week !== undefined) {
      const weekdays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      return `أسبوعياً - يوم ${weekdays[task.day_of_week]}`;
    }
    if (task.recurrence_type === 'daily') {
      return task.interval === 1 ? 'يومياً' : `كل ${task.interval} أيام`;
    }
    return `${task.recurrence_type} (كل ${task.interval || 1})`;
  };

  return (
    <Card className={`overflow-hidden border-r-4 ${!task.is_active ? 'border-r-muted' : task.priority === 'high' ? 'border-r-orange-500' : task.priority === 'medium' ? 'border-r-blue-500' : 'border-r-green-500'}`}>
      <CardHeader className="pb-2">
        <div className="flex flex-row-reverse justify-between items-start">
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onToggleStatus(task.id, task.is_active)}>
              {task.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(task.id)}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
          <CardTitle className="text-base font-medium line-clamp-1 text-right">{task.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pb-4 pt-0">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{renderRecurrence(task)}</span>
            <Calendar className="h-4 w-4 shrink-0 mr-auto" />
          </div>
          
          {task.next_generation_date && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>الإنشاء التالي: {formatDate(task.next_generation_date)}</span>
              <Calendar className="h-4 w-4 shrink-0 mr-auto" />
            </div>
          )}
          
          {task.last_generated_date && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>آخر إنشاء: {formatDate(task.last_generated_date)}</span>
              <Clock className="h-4 w-4 shrink-0 mr-auto" />
            </div>
          )}

          <div className="flex justify-between items-center">
            <TaskPriorityBadge priority={task.priority} />
            
            {task.requires_deliverable && (
              <div className="flex items-center gap-2 text-green-600">
                <span>تتطلب مستلمات</span>
                <Check className="h-4 w-4 shrink-0" />
              </div>
            )}
          </div>

          {task.project_name && (
            <div className="flex items-center gap-2 text-muted-foreground justify-end">
              <span>المشروع: {task.project_name}</span>
            </div>
          )}

          {task.workspace_name && !task.project_name && (
            <div className="flex items-center gap-2 text-muted-foreground justify-end">
              <span>مساحة العمل: {task.workspace_name}</span>
            </div>
          )}

          {task.assignee_name && (
            <div className="flex items-center gap-2 text-muted-foreground justify-end">
              <span>المسؤول: {task.assignee_name}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
