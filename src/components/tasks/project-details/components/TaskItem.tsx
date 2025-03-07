
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditTaskDialog } from "@/components/tasks/project-details/EditTaskDialog";
import { Task } from "@/types/workspace";
import { ViewTaskDialog } from "@/components/tasks/project-details/ViewTaskDialog";
import { DeleteTaskDialog } from "@/components/tasks/project-details/DeleteTaskDialog";
import { TaskDependenciesBadge } from './TaskDependenciesBadge';

export interface TaskItemProps {
  task: Task;
  getStatusBadge?: (status: string) => JSX.Element;
  getPriorityBadge?: (priority: string) => JSX.Element;
  formatDate: (date: string | null | undefined) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId: string;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => Promise<void>;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  projectId,
  onEdit,
  onDelete
}) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Default status badge if not provided
  const defaultStatusBadge = (status: string) => {
    return (
      <Badge variant={
        status === 'completed' ? 'success' : 
        status === 'in_progress' ? 'info' : 
        status === 'pending' ? 'warning' : 'outline'
      }>
        {status}
      </Badge>
    );
  };
  
  // Default priority badge if not provided
  const defaultPriorityBadge = (priority: string) => {
    return (
      <Badge variant={
        priority === 'high' ? 'destructive' : 
        priority === 'medium' ? 'warning' : 
        priority === 'low' ? 'outline' : 'secondary'
      }>
        {priority}
      </Badge>
    );
  };
  
  const handleStatusChange = (newStatus: string) => {
    onStatusChange(task.id, newStatus);
  };
  
  const handleTaskUpdated = () => {
    // Refresh the task
    onEdit(task);
  };
  
  const renderStatusBadge = getStatusBadge || defaultStatusBadge;
  const renderPriorityBadge = getPriorityBadge || defaultPriorityBadge;

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h3 className="font-medium text-md line-clamp-2" onClick={() => setShowViewDialog(true)}>
              {task.title}
            </h3>
            
            <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
              {task.due_date && (
                <span>تاريخ الاستحقاق: {formatDate(task.due_date)}</span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {renderStatusBadge(task.status)}
              {renderPriorityBadge(task.priority)}
              
              {/* Task Dependencies Badge */}
              <TaskDependenciesBadge taskId={task.id} />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => setShowEditDialog(true)}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
      
      {/* Edit Task Dialog */}
      <EditTaskDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        task={task}
        projectId={projectId}
        projectStages={[]}
        projectMembers={[]}
        onStatusChange={handleStatusChange}
        onTaskUpdated={handleTaskUpdated}
      />
      
      {/* View Task Dialog */}
      <ViewTaskDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        task={task}
        onTaskUpdated={handleTaskUpdated}
      />
      
      {/* Delete Task Dialog */}
      <DeleteTaskDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        taskId={task.id}
        taskTitle={task.title}
        onDelete={onDelete}
      />
    </Card>
  );
};
