
import React, { useState } from "react";
import { useMeetingTasks } from "@/hooks/meetings/useMeetingTasks";
import { useCreateMeetingTask } from "@/hooks/meetings/useCreateMeetingTask";
import { useDeleteMeetingTask } from "@/hooks/meetings/useDeleteMeetingTask";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2, Edit } from "lucide-react";
import { TaskType, TaskStatus } from "@/types/meeting";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { EditTaskDialog } from "../tasks/EditTaskDialog";

interface MeetingTasksProps {
  meetingId: string;
}

export const MeetingTasks: React.FC<MeetingTasksProps> = ({ meetingId }) => {
  const { data: tasks, isLoading, error } = useMeetingTasks(meetingId);
  const { mutate: createTask, isPending: isCreating } = useCreateMeetingTask();
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteMeetingTask();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("action_item");
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }
    
    createTask({
      meeting_id: meetingId,
      title,
      description: description || undefined,
      due_date: dueDate || undefined,
      assigned_to: assignedTo || undefined,
      task_type: taskType,
      status: "pending"
    }, {
      onSuccess: () => {
        // Reset form
        setTitle("");
        setDescription("");
        setDueDate("");
        setAssignedTo("");
        setTaskType("action_item");
      }
    });
  };
  
  const handleDeleteClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setDeleteDialogOpen(true);
  };
  
  const handleEditClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setEditDialogOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    if (selectedTaskId) {
      deleteTask({ id: selectedTaskId, meetingId });
    }
    setDeleteDialogOpen(false);
  };
  
  const selectedTask = selectedTaskId ? tasks?.find(task => task.id === selectedTaskId) : null;
  
  const getStatusBadgeColor = (status: TaskStatus) => {
    switch (status) {
      case "pending": return "bg-gray-100 text-gray-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const getTaskTypeLabel = (type: TaskType) => {
    switch (type) {
      case "action_item": return "إجراء";
      case "follow_up": return "متابعة";
      case "decision": return "قرار";
      case "other": return "أخرى";
      default: return type;
    }
  };
  
  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case "pending": return "قيد الانتظار";
      case "in_progress": return "قيد التنفيذ";
      case "completed": return "مكتمل";
      case "cancelled": return "ملغي";
      default: return status;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="mr-2">جاري تحميل المهام...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-red-500 p-4">
        حدث خطأ أثناء تحميل المهام: {error.message}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>إضافة مهمة جديدة</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان المهمة *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أدخل عنوان المهمة"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">وصف المهمة</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="أدخل وصف المهمة (اختياري)"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taskType">نوع المهمة</Label>
                <Select value={taskType} onValueChange={(value) => setTaskType(value as TaskType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع المهمة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="action_item">إجراء</SelectItem>
                    <SelectItem value="follow_up">متابعة</SelectItem>
                    <SelectItem value="decision">قرار</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assignedTo">المسؤول عن التنفيذ</Label>
                <Input
                  id="assignedTo"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="أدخل اسم أو معرف المسؤول"
                />
              </div>
            </div>
            
            <Button type="submit" disabled={!title || isCreating} className="mt-2">
              {isCreating ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الإضافة...
                </>
              ) : (
                <>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة المهمة
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>مهام الاجتماع ({tasks?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks && tasks.length > 0 ? (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-start">
                      <div>
                        <h3 className="font-medium text-lg">{task.title}</h3>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(task.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(task.status)}`}>
                      {getStatusLabel(task.status)}
                    </span>
                    
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {getTaskTypeLabel(task.task_type)}
                    </span>
                    
                    {task.due_date && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        تاريخ الاستحقاق: {new Date(task.due_date).toLocaleDateString('ar-SA')}
                      </span>
                    )}
                    
                    {task.assigned_to && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        المسؤول: {task.assigned_to}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 text-muted-foreground">
              لم يتم إضافة أي مهام لهذا الاجتماع بعد
            </div>
          )}
        </CardContent>
      </Card>
      
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="حذف المهمة"
        description="هل أنت متأكد من رغبتك في حذف هذه المهمة؟ لا يمكن التراجع عن هذا الإجراء."
        onDelete={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
      
      {selectedTask && (
        <EditTaskDialog
          meetingId={meetingId}
          task={selectedTask}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => setEditDialogOpen(false)}
        />
      )}
    </div>
  );
};
