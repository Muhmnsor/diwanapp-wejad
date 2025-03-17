
import { useState } from "react";
import { useMeetingTasks } from "@/hooks/meetings/useMeetingTasks";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Clipboard, Check, X } from "lucide-react";
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

interface MeetingTasksListProps {
  meetingId?: string;
}

export const MeetingTasksList = ({ meetingId }: MeetingTasksListProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { 
    data: tasks = [], 
    isLoading, 
    error,
    refetch 
  } = useMeetingTasks(meetingId);
  
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
                      <span>اسم المسؤول</span> // سيتم استبداله لاحقاً بمعلومات المستخدم
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
                      <Button variant="ghost" size="sm" className="text-green-600">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        تعديل
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Task dialog will be implemented later */}
    </div>
  );
};
