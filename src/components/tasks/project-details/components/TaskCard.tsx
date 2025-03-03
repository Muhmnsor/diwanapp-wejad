
import { Card } from "@/components/ui/card";
import { Task } from "../types/task";
import { Calendar, Users, Check, Clock, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSubtasks } from "../hooks/useSubtasks";
import { SubtasksList } from "./subtasks/SubtasksList";

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
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { 
    subtasks, 
    isLoading: isLoadingSubtasks, 
    addSubtask, 
    updateSubtaskStatus, 
    deleteSubtask 
  } = useSubtasks(task.id);
  
  const handleStatusToggle = () => {
    const newStatus = task.status === 'completed' ? 'in_progress' : 'completed';
    onStatusChange(task.id, newStatus);
  };

  const handleSubtaskAdd = async (taskId: string, title: string) => {
    await addSubtask(title);
  };
  
  return (
    <Card className="p-4 hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-start">
        <div className="space-y-3 flex-1">
          <div className="flex justify-between">
            <h3 className="font-medium">{task.title}</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 ms-2"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {isExpanded && task.description && (
            <p className="text-sm text-gray-600">{task.description}</p>
          )}
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {getStatusBadge(task.status)}
            {getPriorityBadge(task.priority)}
          </div>
          
          <div className="flex flex-col gap-2 text-sm">
            {task.assigned_user_name && (
              <div className="flex items-center">
                <Users className="h-3.5 w-3.5 ml-1.5 text-gray-500" />
                <span className="text-gray-600">{task.assigned_user_name}</span>
              </div>
            )}
            
            {task.due_date && (
              <div className="flex items-center">
                <Calendar className="h-3.5 w-3.5 ml-1.5 text-gray-500" />
                <span className="text-gray-600">{formatDate(task.due_date)}</span>
              </div>
            )}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 flex-shrink-0"
          onClick={handleStatusToggle}
        >
          {task.status === 'completed' ? (
            <Clock className="h-5 w-5 text-amber-500" />
          ) : (
            <Check className="h-5 w-5 text-green-500" />
          )}
        </Button>
      </div>
      
      {/* المهام الفرعية */}
      {isExpanded && (
        <SubtasksList
          taskId={task.id}
          subtasks={subtasks}
          onAddSubtask={handleSubtaskAdd}
          onUpdateSubtaskStatus={updateSubtaskStatus}
          onDeleteSubtask={deleteSubtask}
        />
      )}
    </Card>
  );
};
