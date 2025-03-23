
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { MeetingTask } from "@/types/meeting";
import { FileText, CheckCircle, Clock, Edit, Trash } from "lucide-react";
import { MeetingTaskTemplatesDialog } from "@/components/meetings/tasks/MeetingTaskTemplatesDialog";
import { Button } from "@/components/ui/button";
import { UserNameDisplay } from "@/components/meetings/tasks/UserNameDisplay";
import { useUpdateMeetingTask } from "@/hooks/meetings/useUpdateMeetingTask";
import { EditTaskDialog } from "@/components/meetings/tasks/EditTaskDialog";

interface TasksListProps {
  tasks?: MeetingTask[];
  isLoading?: boolean;
  error?: Error | null;
  onTasksChange?: () => void;
  meetingId?: string;
}

export const TasksList = ({ tasks, isLoading, error, onTasksChange, meetingId }: TasksListProps) => {
  const [selectedTask, setSelectedTask] = useState<MeetingTask | null>(null);
  const [isTemplatesDialogOpen, setIsTemplatesDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { mutate: updateTask } = useUpdateMeetingTask();

  const handleViewTemplates = (task: MeetingTask) => {
    setSelectedTask(task);
    setIsTemplatesDialogOpen(true);
  };

  const handleEditTask = (task: MeetingTask) => {
    setSelectedTask(task);
    setIsEditDialogOpen(true);
  };

  const handleStatusChange = (task: MeetingTask, newStatus: "pending" | "in_progress" | "completed" | "cancelled") => {
    if (!meetingId) return;
    
    updateTask({
      id: task.id,
      meeting_id: meetingId,
      updates: {
        status: newStatus
      }
    }, {
      onSuccess: () => {
        onTasksChange?.();
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">مكتملة</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">قيد التنفيذ</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">قيد الانتظار</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">ملغاة</Badge>;
      default:
        return <Badge variant="outline">غير معروف</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <div className="text-red-500">عالية</div>;
      case "medium":
        return <div className="text-amber-500">متوسطة</div>;
      case "low":
        return <div className="text-green-500">منخفضة</div>;
      default:
        return <div className="text-gray-500">غير محدد</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        جاري تحميل المهام...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-destructive">
        حدث خطأ أثناء تحميل المهام
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        لا توجد مهام حالياً
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-md overflow-hidden">
        <Table dir="rtl">
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">المهمة</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">الأولوية</TableHead>
              <TableHead className="text-right">المكلف</TableHead>
              <TableHead className="text-right">تاريخ الاستحقاق</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium text-right">
                  <div>{task.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {task.task_type === 'action_item' && "إجراء"}
                    {task.task_type === 'follow_up' && "متابعة"}
                    {task.task_type === 'decision' && "قرار"}
                    {task.task_type === 'preparation' && "تحضيرية"}
                    {task.task_type === 'execution' && "تنفيذية"}
                    {task.task_type === 'other' && "أخرى"}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {getStatusBadge(task.status)}
                </TableCell>
                <TableCell className="text-right">
                  {getPriorityBadge(task.priority)}
                </TableCell>
                <TableCell className="text-right">
                  {task.assigned_to ? <UserNameDisplay userId={task.assigned_to} /> : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {task.due_date ? format(new Date(task.due_date), 'dd/MM/yyyy', { locale: ar }) : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleViewTemplates(task)}
                      title="عرض نماذج المهمة"
                      className="h-8 w-8 p-0"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEditTask(task)}
                      title="تعديل المهمة"
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    {task.status !== "completed" && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleStatusChange(task, "completed")}
                        title="اكتمال المهمة"
                        className="text-green-600 h-8 w-8 p-0"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {task.status !== "in_progress" && task.status !== "completed" && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleStatusChange(task, "in_progress")}
                        title="بدء العمل على المهمة"
                        className="text-blue-600 h-8 w-8 p-0"
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {selectedTask && (
        <>
          <MeetingTaskTemplatesDialog
            task={selectedTask}
            open={isTemplatesDialogOpen}
            onOpenChange={setIsTemplatesDialogOpen}
          />
          
          {meetingId && (
            <EditTaskDialog
              task={selectedTask}
              meetingId={meetingId}
              open={isEditDialogOpen}
              onOpenChange={setIsEditDialogOpen}
              onSuccess={onTasksChange}
            />
          )}
        </>
      )}
    </>
  );
};
