
import { useState } from "react";
import { useMeetingTasks } from "@/hooks/meetings/useMeetingTasks";
import { useUpdateTaskStatus } from "@/hooks/meetings/useUpdateMeetingTask";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Clipboard, CheckCircle2, Edit, Trash2, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { AddTaskDialog } from "./AddTaskDialog";
import { EditTaskDialog } from "./EditTaskDialog";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { MeetingTask } from "@/types/meeting";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MeetingTasksListProps {
  meetingId?: string;
}

export const MeetingTasksList = ({ meetingId }: MeetingTasksListProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MeetingTask | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { 
    data: tasks = [], 
    isLoading, 
    error,
    refetch 
  } = useMeetingTasks(meetingId);
  
  const { updateStatus, isLoading: isStatusUpdating } = useUpdateTaskStatus();
  
  const handleMarkComplete = (taskId: string) => {
    if (!meetingId) return;
    updateStatus(taskId, meetingId, 'completed');
  };
  
  const handleDelete = async (taskId: string) => {
    if (!meetingId) return;
    
    try {
      const { error } = await supabase
        .from('meeting_tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      
      toast.success('تم حذف المهمة بنجاح');
      refetch();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('حدث خطأ أثناء حذف المهمة');
    }
  };
  
  const openEditDialog = (task: MeetingTask) => {
    setSelectedTask(task);
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (task: MeetingTask) => {
    setSelectedTask(task);
    setIsDeleteDialogOpen(true);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>جاري تحميل المهام...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>
          حدث خطأ أثناء تحميل المهام: {error.message}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">المهام ({tasks.length})</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Clipboard className="mr-2 h-4 w-4" />
          إضافة مهمة
        </Button>
      </div>
      
      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-lg border">
          <p className="text-muted-foreground">لا توجد مهام مسجلة لهذا الاجتماع</p>
          <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            إضافة مهمة جديدة
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المهمة</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>المسؤول</TableHead>
                <TableHead>تاريخ الاستحقاق</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">
                    {task.title}
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {task.description.length > 50 
                          ? `${task.description.substring(0, 50)}...` 
                          : task.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    {task.task_type === 'action_item' && 'إجراء'}
                    {task.task_type === 'follow_up' && 'متابعة'}
                    {task.task_type === 'decision' && 'قرار'}
                    {task.task_type === 'other' && 'أخرى'}
                  </TableCell>
                  <TableCell>
                    {task.assigned_to ? (
                      <span>{task.assigned_to}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">غير محدد</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {task.due_date ? (
                      <span>{format(parseISO(task.due_date), 'd MMM yyyy', { locale: ar })}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">غير محدد</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <TaskStatusBadge status={task.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-start gap-2">
                      {task.status !== 'completed' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-green-600"
                          onClick={() => handleMarkComplete(task.id)}
                          disabled={isStatusUpdating}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditDialog(task)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive"
                        onClick={() => openDeleteDialog(task)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {meetingId && (
        <>
          <AddTaskDialog 
            open={isAddDialogOpen} 
            onOpenChange={setIsAddDialogOpen}
            meetingId={meetingId}
            onSuccess={refetch}
          />
          
          {selectedTask && (
            <>
              <EditTaskDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                task={selectedTask}
                meetingId={meetingId}
                onSuccess={refetch}
              />
              
              <DeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="حذف المهمة"
                description="هل أنت متأكد من رغبتك في حذف هذه المهمة؟ لا يمكن التراجع عن هذا الإجراء."
                onDelete={() => handleDelete(selectedTask.id)}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};
