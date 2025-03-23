
import React, { useState } from "react";
import { TasksList as BaseTasksList } from "@/components/tasks/TasksList";
import { Task } from "@/components/tasks/types/task";
import { TaskDialogsProvider } from "@/components/tasks/components/dialogs/TaskDialogsProvider";
import { MeetingTask } from "@/types/meeting";
import { MeetingTaskItem } from "./MeetingTaskItem";
import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table";

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

  if (isLoading) {
    return <div className="text-center py-4">جاري تحميل المهام...</div>;
  }

  if (error) {
    return <div className="text-destructive py-4">حدث خطأ أثناء تحميل المهام: {error.message}</div>;
  }

  if (tasks.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">لا توجد مهام لهذا الاجتماع بعد</div>;
  }

  return (
    <>
      <div className="rounded-md border">
        <Table dir="rtl">
          <TableHeader>
            <TableRow>
              <TableHead>المهمة</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>مسند إلى</TableHead>
              <TableHead>تاريخ الاستحقاق</TableHead>
              <TableHead>تاريخ الإنشاء</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <MeetingTaskItem 
                key={task.id} 
                task={task} 
                onStatusChange={onStatusChange} 
              />
            ))}
          </TableBody>
        </Table>
      </div>
      
      {selectedTask && (
        <TaskDialogsProvider 
          task={selectedTask}
          onStatusChange={onStatusChange}
          onTaskUpdated={onTasksChange}
        />
      )}
    </>
  );
};
