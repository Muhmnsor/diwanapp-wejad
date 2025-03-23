
import React, { useState } from "react";
import { Task } from "@/components/tasks/types/task";
import { MeetingTask } from "@/types/meeting";
import { EditTaskDialog } from "./EditTaskDialog";
import { Button } from "@/components/ui/button";
import { PencilIcon, Trash2Icon, MessageSquare, FileText } from "lucide-react";
import { useDeleteMeetingTask } from "@/hooks/meetings/useDeleteMeetingTask";
import { toast } from "sonner";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { getStatusBadge, getPriorityBadge, formatDueDate } from "@/components/tasks/utils/taskFormatters";
import { TaskDialogsProvider } from "@/components/tasks/components/dialogs/TaskDialogsProvider";

interface MeetingTasksListProps {
  tasks: Task[];
  isLoading: boolean;
  error: any;
  onTasksChange: () => void;
  meetingId: string;
  onStatusChange: (taskId: string, status: string) => void;
}

export const MeetingTasksList: React.FC<MeetingTasksListProps> = ({
  tasks,
  isLoading,
  error,
  onTasksChange,
  meetingId,
  onStatusChange
}) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { mutate: deleteTask } = useDeleteMeetingTask();

  // Find the corresponding meeting task for the Task object
  const findMeetingTask = (taskId: string): MeetingTask | undefined => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return undefined;
    
    // Convert Task to MeetingTask
    return {
      id: task.id,
      meeting_id: meetingId,
      title: task.title,
      description: task.description || undefined,
      status: task.status as any,
      priority: task.priority as any,
      due_date: task.due_date || undefined,
      assigned_to: task.assigned_to || undefined,
      created_at: task.created_at,
      created_by: undefined,
      task_type: "action_item", // Default
      requires_deliverable: task.requires_deliverable || false,
      general_task_id: undefined
    };
  };

  const handleEditTask = (taskId: string) => {
    const task = findMeetingTask(taskId);
    if (task) {
      setSelectedTask(task as any);
      setIsEditDialogOpen(true);
    } else {
      toast.error("لم يتم العثور على بيانات المهمة");
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm("هل أنت متأكد من رغبتك في حذف هذه المهمة؟")) {
      deleteTask({ 
        id: taskId, 
        meeting_id: meetingId 
      }, {
        onSuccess: () => {
          onTasksChange();
        }
      });
    }
  };

  // If we're loading or have an error, show appropriate UI
  if (isLoading) {
    return <div className="py-4 text-center">جاري تحميل المهام...</div>;
  }

  if (error) {
    return <div className="py-4 text-center text-red-500">حدث خطأ أثناء تحميل المهام</div>;
  }

  // If there are no tasks, show empty state
  if (!tasks || tasks.length === 0) {
    return <div className="py-4 text-center text-gray-500">لا توجد مهام للاجتماع حتى الآن</div>;
  }

  // Render our tasks in a table format
  return (
    <>
      <div className="border rounded-md overflow-hidden">
        <Table dir="rtl">
          <TableHeader>
            <TableRow>
              <TableHead>المهمة</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الأولوية</TableHead>
              <TableHead>المكلف</TableHead>
              <TableHead>تاريخ الاستحقاق</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map(task => (
              <TableRow key={task.id}>
                <TableCell>
                  <div className="font-medium">{task.title}</div>
                  {task.description && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {task.description}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {getStatusBadge(task.status)}
                </TableCell>
                <TableCell>
                  {task.priority ? getPriorityBadge(task.priority) : null}
                </TableCell>
                <TableCell>
                  {task.assigned_user_name || task.assigned_to || "غير محدد"}
                </TableCell>
                <TableCell>
                  {task.due_date ? formatDueDate(task.due_date) : "غير محدد"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <select 
                      value={task.status}
                      onChange={(e) => onStatusChange(task.id, e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="pending">قيد الانتظار</option>
                      <option value="in_progress">قيد التنفيذ</option>
                      <option value="completed">مكتملة</option>
                      <option value="cancelled">ملغية</option>
                    </select>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditTask(task.id)}
                      className="h-8 w-8"
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span className="sr-only">تعديل</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTask(task.id)}
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                    >
                      <Trash2Icon className="h-4 w-4" />
                      <span className="sr-only">حذف</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {selectedTask && (
        <EditTaskDialog
          meetingId={meetingId}
          task={selectedTask as MeetingTask}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={onTasksChange}
        />
      )}
    </>
  );
};
