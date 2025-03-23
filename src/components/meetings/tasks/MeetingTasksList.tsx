
import React, { useState } from "react";
import { MeetingTask } from "@/types/meeting";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MessageCircle, Paperclip, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EditTaskDialog } from "./EditTaskDialog";
import { DeleteTaskDialog } from "./DeleteTaskDialog";

interface MeetingTasksListProps {
  tasks: MeetingTask[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onTasksChange: () => void;
  meetingId: string;
}

export const MeetingTasksList: React.FC<MeetingTasksListProps> = ({
  tasks,
  isLoading,
  error,
  onTasksChange,
  meetingId,
}) => {
  const [taskToEdit, setTaskToEdit] = useState<MeetingTask | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<MeetingTask | null>(null);
  const [taskToDiscuss, setTaskToDiscuss] = useState<MeetingTask | null>(null);
  const [taskForAttachment, setTaskForAttachment] = useState<MeetingTask | null>(null);
  const [taskForSubtask, setTaskForSubtask] = useState<MeetingTask | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "preparation":
        return "تحضيرية";
      case "execution":
        return "تنفيذية";
      case "follow_up":
        return "متابعة";
      case "action_item":
        return "إجراء";
      case "decision":
        return "قرار";
      default:
        return "أخرى";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "عالية";
      case "medium":
        return "متوسطة";
      case "low":
        return "منخفضة";
      default:
        return "متوسطة";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col p-4 border rounded-lg">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <div className="flex justify-between">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg border border-red-200">
        حدث خطأ أثناء تحميل المهام: {error.message}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        لا توجد مهام حالياً
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task.id} className="flex flex-col p-4 border rounded-lg bg-white shadow-sm">
          <div className="mb-3">
            <h3 className="text-lg font-semibold">{task.title}</h3>
            {task.description && (
              <p className="text-gray-600 text-sm mt-1">{task.description}</p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="outline" className={getStatusColor(task.status)}>
              {task.status === "pending" && "قيد الانتظار"}
              {task.status === "in_progress" && "قيد التنفيذ"}
              {task.status === "completed" && "مكتمل"}
              {task.status === "cancelled" && "ملغي"}
            </Badge>
            
            <Badge variant="outline" className="bg-gray-100">
              {getTypeLabel(task.task_type)}
            </Badge>
            
            <Badge variant="outline" className={getPriorityColor(task.priority || "medium")}>
              {getPriorityLabel(task.priority || "medium")}
            </Badge>
            
            {task.requires_deliverable && (
              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                تتطلب مستلمات
              </Badge>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-2">
            <div className="flex flex-col xs:flex-row gap-2">
              {task.due_date && (
                <span className="text-sm text-gray-600">
                  تاريخ الاستحقاق: {new Date(task.due_date).toLocaleDateString("ar-SA")}
                </span>
              )}
              {task.assigned_to && (
                <span className="text-sm text-gray-600">
                  المسؤول: {task.assigned_to}
                </span>
              )}
            </div>
            
            <div className="flex gap-1 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() => setTaskToEdit(task)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() => setTaskToDelete(task)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() => setTaskToDiscuss(task)}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() => setTaskForAttachment(task)}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() => setTaskForSubtask(task)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}

      {/* Dialog for editing task */}
      {taskToEdit && (
        <EditTaskDialog
          meetingId={meetingId}
          task={taskToEdit}
          open={!!taskToEdit}
          onOpenChange={(open) => !open && setTaskToEdit(null)}
          onSuccess={onTasksChange}
        />
      )}

      {/* Dialog for deleting task */}
      {taskToDelete && (
        <DeleteTaskDialog
          task={taskToDelete}
          open={!!taskToDelete}
          onOpenChange={(open) => !open && setTaskToDelete(null)}
          onSuccess={onTasksChange}
        />
      )}

      {/* Placeholder for discussion dialog */}
      {taskToDiscuss && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setTaskToDiscuss(null)}>
          <div className="bg-white p-6 rounded-lg max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">مناقشة المهمة</h3>
            <p className="my-4">سيتم تنفيذ هذه الميزة قريباً</p>
            <Button onClick={() => setTaskToDiscuss(null)}>إغلاق</Button>
          </div>
        </div>
      )}

      {/* Placeholder for attachment dialog */}
      {taskForAttachment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setTaskForAttachment(null)}>
          <div className="bg-white p-6 rounded-lg max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">مرفقات المهمة</h3>
            <p className="my-4">سيتم تنفيذ هذه الميزة قريباً</p>
            <Button onClick={() => setTaskForAttachment(null)}>إغلاق</Button>
          </div>
        </div>
      )}

      {/* Placeholder for subtask dialog */}
      {taskForSubtask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setTaskForSubtask(null)}>
          <div className="bg-white p-6 rounded-lg max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">إضافة مهمة فرعية</h3>
            <p className="my-4">سيتم تنفيذ هذه الميزة قريباً</p>
            <Button onClick={() => setTaskForSubtask(null)}>إغلاق</Button>
          </div>
        </div>
      )}
    </div>
  );
};
