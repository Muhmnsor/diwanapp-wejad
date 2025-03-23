
import { useState } from "react";
import { useMeetingTasks } from "@/hooks/meetings/useMeetingTasks";
import { useDeleteMeetingTask } from "@/hooks/meetings/useDeleteMeetingTask";
import { Button } from "@/components/ui/button";
import { Plus, Trash, Edit, CheckCircle, Clock, AlertCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddTaskDialog } from "../tasks/AddTaskDialog";
import { EditTaskDialog } from "../tasks/EditTaskDialog";
import { Task, TaskStatus, TaskType } from "@/types/meeting";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MeetingTasksTabProps {
  meetingId: string;
}

export const MeetingTasksTab = ({ meetingId }: MeetingTasksTabProps) => {
  const { data: tasks, isLoading, error } = useMeetingTasks(meetingId);
  const { mutate: deleteTask } = useDeleteMeetingTask();
  
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditTaskOpen(true);
  };
  
  const handleDeleteTask = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (selectedTask) {
      deleteTask({
        id: selectedTask.id,
        meeting_id: meetingId
      });
      setIsDeleteDialogOpen(false);
    }
  };
  
  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };
  
  const getTaskTypeLabel = (type: TaskType) => {
    switch (type) {
      case "action_item":
        return "إجراء";
      case "follow_up":
        return "متابعة";
      case "decision":
        return "قرار";
      case "other":
        return "أخرى";
      default:
        return type;
    }
  };
  
  const getTaskTypeBadge = (type: TaskType) => {
    let variant: "default" | "outline" | "secondary" | "destructive" = "default";
    
    switch (type) {
      case "action_item":
        variant = "default";
        break;
      case "follow_up":
        variant = "secondary";
        break;
      case "decision":
        variant = "outline";
        break;
      case "other":
        variant = "destructive";
        break;
    }
    
    return (
      <Badge variant={variant}>
        {getTaskTypeLabel(type)}
      </Badge>
    );
  };
  
  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case "completed":
        return "مكتمل";
      case "in_progress":
        return "قيد التنفيذ";
      case "pending":
        return "قيد الانتظار";
      case "cancelled":
        return "ملغي";
      default:
        return status;
    }
  };
  
  if (isLoading) {
    return <div>جاري تحميل المهام...</div>;
  }
  
  if (error) {
    return <div>حدث خطأ أثناء تحميل المهام</div>;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-semibold">مهام الاجتماع</h3>
        <Button onClick={() => setIsAddTaskOpen(true)} size="sm">
          <Plus className="h-4 w-4 ml-2" />
          إضافة مهمة
        </Button>
      </div>
      
      {tasks && tasks.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>العنوان</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>تاريخ الاستحقاق</TableHead>
              <TableHead>المسؤول</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{task.title}</TableCell>
                <TableCell>{getTaskTypeBadge(task.task_type)}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {getStatusIcon(task.status)}
                    <span className="mr-1">{getStatusLabel(task.status)}</span>
                  </div>
                </TableCell>
                <TableCell>{task.due_date || "-"}</TableCell>
                <TableCell>{task.assigned_to || "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditTask(task)}
                      title="تعديل"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTask(task)}
                      title="حذف"
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          لا توجد مهام حاليًا. أضف مهامًا جديدة لتظهر هنا.
        </div>
      )}
      
      <AddTaskDialog
        meetingId={meetingId}
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
      />
      
      {selectedTask && (
        <EditTaskDialog
          meetingId={meetingId}
          task={selectedTask}
          open={isEditTaskOpen}
          onOpenChange={setIsEditTaskOpen}
        />
      )}
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذه المهمة؟</AlertDialogTitle>
            <AlertDialogDescription>
              لا يمكن التراجع عن هذا الإجراء. سيتم حذف المهمة نهائيًا.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
