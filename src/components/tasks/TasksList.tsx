
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { MeetingTask } from "@/types/meeting";
import { FileText } from "lucide-react";
import { MeetingTaskTemplatesDialog } from "@/components/meetings/tasks/MeetingTaskTemplatesDialog";
import { Button } from "@/components/ui/button";
import { UserNameDisplay } from "@/components/meetings/tasks/UserNameDisplay";

interface TasksListProps {
  tasks?: MeetingTask[];
  isLoading?: boolean;
  error?: Error | null;
  onTasksChange?: () => void;
}

export const TasksList = ({ tasks, isLoading, error, onTasksChange }: TasksListProps) => {
  const [selectedTask, setSelectedTask] = useState<MeetingTask | null>(null);
  const [isTemplatesDialogOpen, setIsTemplatesDialogOpen] = useState(false);

  const handleViewTemplates = (task: MeetingTask) => {
    setSelectedTask(task);
    setIsTemplatesDialogOpen(true);
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
      <Table dir="rtl">
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">عنوان المهمة</TableHead>
            <TableHead className="text-right">النوع</TableHead>
            <TableHead className="text-right">تاريخ الاستحقاق</TableHead>
            <TableHead className="text-right">الحالة</TableHead>
            <TableHead className="text-right">المسؤول</TableHead>
            <TableHead className="text-right">النماذج</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-medium text-right">{task.title}</TableCell>
              <TableCell className="text-right">
                {task.task_type === 'action_item' && <Badge variant="outline">إجراء</Badge>}
                {task.task_type === 'follow_up' && <Badge variant="outline">متابعة</Badge>}
                {task.task_type === 'decision' && <Badge variant="outline">قرار</Badge>}
                {task.task_type === 'preparation' && <Badge variant="outline">تحضيرية</Badge>}
                {task.task_type === 'execution' && <Badge variant="outline">تنفيذية</Badge>}
                {task.task_type === 'other' && <Badge variant="outline">أخرى</Badge>}
              </TableCell>
              <TableCell className="text-right">
                {task.due_date ? format(new Date(task.due_date), 'dd/MM/yyyy', { locale: ar }) : '-'}
              </TableCell>
              <TableCell className="text-right">
                {task.status === 'pending' && <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">قيد الانتظار</Badge>}
                {task.status === 'in_progress' && <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">قيد التنفيذ</Badge>}
                {task.status === 'completed' && <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">مكتملة</Badge>}
                {task.status === 'cancelled' && <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">ملغاة</Badge>}
              </TableCell>
              <TableCell className="text-right">
                {task.assigned_to ? <UserNameDisplay userId={task.assigned_to} /> : '-'}
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleViewTemplates(task)}
                  title="عرض نماذج المهمة"
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {selectedTask && (
        <MeetingTaskTemplatesDialog
          task={selectedTask}
          open={isTemplatesDialogOpen}
          onOpenChange={setIsTemplatesDialogOpen}
        />
      )}
    </>
  );
};
