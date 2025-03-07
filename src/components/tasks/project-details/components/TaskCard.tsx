import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  MoreHorizontal, 
  Calendar, 
  Clock, 
  Edit, 
  Trash, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  FileText,
  MessageSquare,
  Paperclip
} from "lucide-react";
import { formatDate, formatDateWithTime } from "@/lib/utils";
import { Task } from "@/types/workspace";
import { EditTaskDialog } from "../EditTaskDialog";
import { DeleteTaskDialog } from "../DeleteTaskDialog";
import { ViewTaskDialog } from "../ViewTaskDialog";
import { TaskDependenciesBadge } from "./TaskDependenciesBadge";

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: string) => void;
  onDelete: (taskId: string) => void;
  onTaskUpdated: () => void;
  projectStages?: { id: string; name: string }[];
  projectMembers?: { id: string; name: string }[];
  isGeneral?: boolean;
}

export const TaskCard = ({ 
  task, 
  onStatusChange, 
  onDelete,
  onTaskUpdated,
  projectStages,
  projectMembers,
  isGeneral = false
}: TaskCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'delayed':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتملة';
      case 'in_progress':
        return 'قيد التنفيذ';
      case 'pending':
        return 'قيد الانتظار';
      case 'delayed':
        return 'متأخرة';
      default:
        return status;
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPriorityLabel = (priority: string) => {
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
  
  const handleStatusChange = (newStatus: string) => {
    onStatusChange(task.id, newStatus);
  };
  
  const handleDelete = () => {
    setIsDeleteDialogOpen(false);
    onDelete(task.id);
  };
  
  return (
    <div
      className={`border rounded-md overflow-hidden transition-all duration-200 ${
        task.status === 'completed' ? 'opacity-80' : ''
      }`}
    >
      <div className="flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center justify-between mb-2 p-3 pb-0">
            <div 
              className="font-medium cursor-pointer hover:text-primary transition-colors"
              onClick={() => setIsViewDialogOpen(true)}
            >
              {task.title}
            </div>
            
            <div className="flex items-center gap-1">
              <TaskDependenciesBadge taskId={task.id} />
              
              <Badge className={getStatusColor(task.status || 'pending')}>
                {getStatusLabel(task.status || 'pending')}
              </Badge>
            </div>
          </div>
          
          {task.description && (
            <div className="px-3 py-1 text-sm text-gray-600 line-clamp-2">
              {task.description}
            </div>
          )}
          
          <div className="px-3 py-1 flex flex-wrap gap-2">
            {task.due_date && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="flex items-center gap-1 text-xs">
                      <Calendar className="h-3 w-3" />
                      {formatDate(task.due_date)}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>تاريخ الاستحقاق</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {task.priority && (
              <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
                {getPriorityLabel(task.priority)}
              </Badge>
            )}
            
            {task.stage_name && (
              <Badge variant="secondary" className="text-xs">
                {task.stage_name}
              </Badge>
            )}
            
            {task.category && (
              <Badge variant="outline" className="text-xs">
                {task.category}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="p-3 pt-2 flex items-center justify-between mt-auto border-t">
          <div className="flex items-center gap-2">
            {task.assigned_to && task.assigned_user_name ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {task.assigned_user_name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{task.assigned_user_name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Badge variant="outline" className="text-xs">
                غير مسندة
              </Badge>
            )}
            
            <div className="flex items-center gap-1">
              {task.templates && task.templates.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-gray-500">
                        <FileText className="h-4 w-4" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{task.templates.length} نماذج</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {task.attachment_url && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-gray-500">
                        <Paperclip className="h-4 w-4" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>مرفقات</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsViewDialogOpen(true)}>
                  عرض التفاصيل
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="h-4 w-4 ml-2" />
                  تعديل
                </DropdownMenuItem>
                
                {task.status !== 'completed' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                    <CheckCircle2 className="h-4 w-4 ml-2" />
                    تحديد كمكتملة
                  </DropdownMenuItem>
                )}
                
                {task.status !== 'in_progress' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('in_progress')}>
                    <Clock className="h-4 w-4 ml-2" />
                    تحديد كقيد التنفيذ
                  </DropdownMenuItem>
                )}
                
                {task.status !== 'pending' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('pending')}>
                    <AlertCircle className="h-4 w-4 ml-2" />
                    تحديد كقيد الانتظار
                  </DropdownMenuItem>
                )}
                
                {task.status !== 'delayed' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('delayed')}>
                    <XCircle className="h-4 w-4 ml-2" />
                    تحديد كمتأخرة
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem 
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-red-600"
                >
                  <Trash className="h-4 w-4 ml-2" />
                  حذف
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      <EditTaskDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        task={task}
        onTaskUpdated={onTaskUpdated}
        projectStages={projectStages}
        projectMembers={projectMembers}
        isGeneral={isGeneral}
      />
      
      <DeleteTaskDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        taskId={task.id}
        taskTitle={task.title}
        onDelete={handleDelete}
      />
      
      <ViewTaskDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        taskId={task.id}
        onTaskUpdated={onTaskUpdated}
      />
    </div>
  );
};
