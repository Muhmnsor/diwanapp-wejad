
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, User, Edit, Trash, Clock, CheckCircle2 } from "lucide-react";
import { Task } from "../types/task";
import { formatDate } from "@/utils/formatters";
import { useState } from "react";

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: string) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onEdit: (task: Task) => void;
}

export const TaskCard = ({ 
  task, 
  onStatusChange,
  onDelete,
  onEdit 
}: TaskCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleStatusChange = (newStatus: string) => {
    onStatusChange(task.id, newStatus);
  };
  
  const handleEdit = () => {
    onEdit(task);
  };
  
  const handleDelete = async () => {
    if (isDeleting) {
      try {
        await onDelete(task.id);
      } catch (error) {
        console.error("Error deleting task:", error);
        setIsDeleting(false);
      }
    } else {
      setIsDeleting(true);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'delayed':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'in_progress':
        return 'قيد التنفيذ';
      case 'completed':
        return 'مكتملة';
      case 'delayed':
        return 'متأخرة';
      default:
        return status;
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };
  
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'عالية';
      case 'medium':
        return 'متوسطة';
      case 'low':
        return 'منخفضة';
      default:
        return priority;
    }
  };
  
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-lg">{task.title}</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                <Badge className={`${getStatusColor(task.status)}`}>
                  {getStatusText(task.status)}
                </Badge>
                
                <Badge className={`${getPriorityColor(task.priority)}`}>
                  {getPriorityText(task.priority)}
                </Badge>
                
                {task.category && (
                  <Badge variant="outline">
                    {task.category}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={handleEdit}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className={isDeleting ? "text-red-600" : ""}
                onClick={handleDelete}
              >
                {isDeleting ? (
                  <>
                    <Trash className="h-4 w-4 text-red-600" />
                    <span className="sr-only">تأكيد الحذف</span>
                  </>
                ) : (
                  <Trash className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          {task.description && (
            <p className="text-gray-600 text-sm">{task.description}</p>
          )}
          
          <div className="flex flex-wrap gap-3 text-sm text-gray-500">
            {task.due_date && (
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                <span>تاريخ الإستحقاق: {formatDate(task.due_date)}</span>
              </div>
            )}
            
            {task.assigned_to && task.assigned_user_name && (
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>تم تعيينه إلى: {task.assigned_user_name}</span>
              </div>
            )}
          </div>
          
          {task.status !== 'completed' && (
            <div className="flex flex-wrap gap-2 pt-2">
              {task.status === 'pending' && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-blue-600"
                  onClick={() => handleStatusChange('in_progress')}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  بدء العمل
                </Button>
              )}
              
              <Button 
                size="sm" 
                variant="outline" 
                className="text-green-600"
                onClick={() => handleStatusChange('completed')}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                إكمال
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
