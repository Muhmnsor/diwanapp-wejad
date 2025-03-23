
import React, { useState } from "react";
import { MeetingTask } from "@/types/meeting";
import { Task } from "@/components/tasks/types/task";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { TaskDiscussionDialog } from "@/components/tasks/components/TaskDiscussionDialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MeetingTaskItemProps {
  task: Task;
  meetingTask: MeetingTask;
  onStatusChange: (taskId: string, status: string) => void;
  onTaskUpdated: () => void;
}

export const MeetingTaskItem = ({ 
  task, 
  meetingTask, 
  onStatusChange,
  onTaskUpdated 
}: MeetingTaskItemProps) => {
  const [isDiscussionOpen, setIsDiscussionOpen] = useState(false);

  // Status badge styles
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  // Task type badge styles
  const getTaskTypeBadgeStyle = (type: string) => {
    switch (type) {
      case "action_item":
        return "bg-purple-100 text-purple-800";
      case "follow_up":
        return "bg-blue-100 text-blue-800";
      case "decision":
        return "bg-indigo-100 text-indigo-800";
      case "preparation":
        return "bg-teal-100 text-teal-800";
      case "execution":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Priority badge styles
  const getPriorityBadgeStyle = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Task type label
  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case "action_item": return "بند تنفيذي";
      case "follow_up": return "متابعة";
      case "decision": return "قرار";
      case "preparation": return "تحضير";
      case "execution": return "تنفيذ";
      default: return type;
    }
  };

  return (
    <div className="border rounded-md p-4 mb-3 bg-white hover:shadow-sm transition-shadow">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
        <div className="flex-1">
          <h3 className="font-medium mb-1">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
          )}
          
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className={cn(getStatusBadgeStyle(task.status))}>
              {task.status === "pending" && "قيد الانتظار"}
              {task.status === "in_progress" && "قيد التنفيذ"}
              {task.status === "completed" && "مكتملة"}
              {task.status === "cancelled" && "ملغاة"}
            </Badge>
            
            {meetingTask.task_type && (
              <Badge variant="outline" className={cn(getTaskTypeBadgeStyle(meetingTask.task_type))}>
                {getTaskTypeLabel(meetingTask.task_type)}
              </Badge>
            )}
            
            {task.priority && (
              <Badge variant="outline" className={cn(getPriorityBadgeStyle(task.priority))}>
                {task.priority === "high" && "أولوية عالية"}
                {task.priority === "medium" && "أولوية متوسطة"}
                {task.priority === "low" && "أولوية منخفضة"}
              </Badge>
            )}
            
            {meetingTask.requires_deliverable && (
              <Badge variant="outline" className="bg-violet-100 text-violet-800">
                تتطلب مستلمات
              </Badge>
            )}
          </div>
          
          <div className="mt-3 text-sm text-gray-500">
            {task.assigned_to && task.assigned_user_name && (
              <div className="mb-1">المسؤول: {task.assigned_user_name}</div>
            )}
            {task.due_date && (
              <div className="mb-1">تاريخ الاستحقاق: {new Date(task.due_date).toLocaleDateString('ar-SA')}</div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 mt-3 md:mt-0">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={() => setIsDiscussionOpen(true)}
          >
            <MessageCircle className="h-4 w-4 ml-1" />
            المناقشة
          </Button>
          
          {/* Status buttons could be added here if needed */}
        </div>
      </div>
      
      <TaskDiscussionDialog
        open={isDiscussionOpen}
        onOpenChange={setIsDiscussionOpen}
        task={task}
        onStatusChange={onStatusChange}
      />
    </div>
  );
};
