
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, Check, Clock, AlertCircle } from "lucide-react";
import { Task } from "../TasksList";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

interface TaskCardProps {
  task: Task;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
}

export const TaskCard = ({ 
  task, 
  getStatusBadge, 
  getPriorityBadge, 
  formatDate,
  onStatusChange
}: TaskCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuthStore();
  
  const canChangeStatus = () => {
    // Allow status change if:
    // 1. User is assigned to the task
    // 2. User is an admin
    return (
      user?.id === task.assigned_to || 
      user?.isAdmin || 
      user?.role === 'admin'
    );
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!canChangeStatus()) {
      toast.error("لا يمكنك تغيير حالة المهمة لأنك لست المكلف بها");
      return;
    }
    
    setIsUpdating(true);
    try {
      await onStatusChange(task.id, newStatus);
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("حدث خطأ أثناء تحديث حالة المهمة");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="border hover:border-primary/50 transition-colors">
      <CardContent className="p-4 text-right">
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-2">
            {getStatusBadge(task.status)}
            {getPriorityBadge(task.priority)}
          </div>
          <h3 className="font-semibold text-lg">{task.title}</h3>
        </div>
        
        {task.description && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{task.description}</p>
        )}
        
        <div className="flex flex-col gap-2 items-end">
          {task.assigned_user_name && (
            <div className="flex items-center text-sm">
              <span className="mr-1">{task.assigned_user_name}</span>
              <Users className="h-3.5 w-3.5 mr-1 text-gray-500" />
            </div>
          )}
          
          {task.due_date && (
            <div className="flex items-center text-sm">
              <span className="mr-1">{formatDate(task.due_date)}</span>
              <Calendar className="h-3.5 w-3.5 mr-1 text-gray-500" />
            </div>
          )}
          
          {task.stage_name && (
            <Badge variant="outline" className="font-normal text-xs">
              {task.stage_name}
            </Badge>
          )}

          {canChangeStatus() && (
            <div className="mt-3 flex justify-end">
              {task.status !== 'completed' ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 px-3 mt-2"
                  onClick={() => handleStatusUpdate('completed')}
                  disabled={isUpdating}
                >
                  <Check className="h-3.5 w-3.5 text-green-500 ml-1" />
                  إكمال المهمة
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 px-3 mt-2"
                  onClick={() => handleStatusUpdate('in_progress')}
                  disabled={isUpdating}
                >
                  <Clock className="h-3.5 w-3.5 text-amber-500 ml-1" />
                  إعادة فتح المهمة
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
