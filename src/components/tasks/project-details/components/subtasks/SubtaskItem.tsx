
import { useState } from "react";
import { Trash, Check, Clock, AlertCircle, User, Calendar, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "../../utils/taskFormatters";

interface SubtaskProps {
  subtask: {
    id: string;
    title: string;
    status: string;
    due_date: string | null;
    assigned_to: string | null;
    priority: string | null;
  };
  onStatusChange: (subtaskId: string, newStatus: string) => Promise<void>;
  onDelete: (subtaskId: string) => Promise<void>;
}

export const SubtaskItem = ({ subtask, onStatusChange, onDelete }: SubtaskProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Check className="h-3 w-3 mr-1" /> مكتملة
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Clock className="h-3 w-3 mr-1" /> قيد التنفيذ
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            <AlertCircle className="h-3 w-3 mr-1" /> معلقة
          </Badge>
        );
    }
  };

  const getPriorityBadge = (priority: string | null) => {
    if (!priority) return null;
    
    switch (priority) {
      case 'high':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <Flag className="h-3 w-3 mr-1" /> عالية
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            <Flag className="h-3 w-3 mr-1" /> متوسطة
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Flag className="h-3 w-3 mr-1" /> منخفضة
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (subtask.status === newStatus) return;
    
    setIsUpdating(true);
    try {
      await onStatusChange(subtask.id, newStatus);
    } catch (error) {
      console.error("Error updating subtask status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("هل أنت متأكد من حذف هذه المهمة الفرعية؟")) {
      setIsDeleting(true);
      try {
        await onDelete(subtask.id);
      } catch (error) {
        console.error("Error deleting subtask:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="flex flex-col p-2 rounded-md bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-sm font-medium">{subtask.title}</div>
        </div>
        
        <div className="flex items-center gap-2">
          <div>{getStatusBadge(subtask.status)}</div>
          
          <div className="flex">
            {subtask.status !== 'completed' ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => handleStatusChange('completed')}
                disabled={isUpdating}
              >
                <Check className="h-4 w-4 text-green-500" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => handleStatusChange('in_progress')}
                disabled={isUpdating}
              >
                <Clock className="h-4 w-4 text-blue-500" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-red-500"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
        {subtask.due_date && (
          <div className="flex items-center">
            <Calendar className="h-3 w-3 ml-1" />
            {formatDate(subtask.due_date)}
          </div>
        )}
        
        {subtask.assigned_to && (
          <div className="flex items-center">
            <User className="h-3 w-3 ml-1" />
            {subtask.assigned_to}
          </div>
        )}
        
        {getPriorityBadge(subtask.priority)}
      </div>
    </div>
  );
};
