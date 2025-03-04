
import { Check, Clock, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Subtask } from "../../types/subtask";
import { formatDate } from "../../utils/taskFormatters";
import { useState } from "react";
import { usePermissionCheck } from "../../hooks/usePermissionCheck";
import { Tooltip } from "@/components/ui/tooltip";

interface SubtaskItemProps {
  subtask: Subtask;
  onUpdateStatus: (subtaskId: string, newStatus: string) => Promise<void>;
  onDelete: (subtaskId: string) => Promise<void>;
}

export const SubtaskItem = ({ subtask, onUpdateStatus, onDelete }: SubtaskItemProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // استخدام هوك التحقق من الصلاحيات
  const { hasPermission, isLoading } = usePermissionCheck(subtask.assigned_to);
  
  const handleStatusUpdate = async (newStatus: string) => {
    if (!hasPermission) return;
    
    setIsUpdating(true);
    try {
      await onUpdateStatus(subtask.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleDelete = async () => {
    if (!hasPermission) return;
    
    setIsDeleting(true);
    try {
      await onDelete(subtask.id);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
      <div className="flex items-center">
        <div className={`w-2 h-2 rounded-full mr-2 ${subtask.status === 'completed' ? 'bg-green-500' : 'bg-amber-500'}`} />
        <span className={subtask.status === 'completed' ? 'line-through text-gray-500' : ''}>
          {subtask.title}
        </span>
        
        {subtask.assigned_user_name && (
          <span className="mr-2 text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-sm mr-2">
            {subtask.assigned_user_name}
          </span>
        )}
        
        {subtask.due_date && (
          <span className="text-xs text-gray-500">
            {formatDate(subtask.due_date)}
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-1">
        {isLoading ? (
          <div className="h-6 w-12 bg-gray-100 animate-pulse rounded"></div>
        ) : hasPermission ? (
          <>
            {subtask.status !== 'completed' ? (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => handleStatusUpdate('completed')}
                disabled={isUpdating}
              >
                <Check className="h-3.5 w-3.5 text-green-500" />
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => handleStatusUpdate('pending')}
                disabled={isUpdating}
              >
                <Clock className="h-3.5 w-3.5 text-amber-500" />
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 text-red-500"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash className="h-3.5 w-3.5" />
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
};
