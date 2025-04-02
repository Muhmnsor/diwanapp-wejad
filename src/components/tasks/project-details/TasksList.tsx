import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Task } from "./types/task";
import { TaskTableRow } from "../components/TaskTableRow";
import { Loader2 } from "lucide-react";

interface TasksListProps {
  tasks?: Task[];
  isLoading?: boolean;
  onTaskUpdated?: () => void;
}

export function TasksList({ 
  tasks = [], 
  isLoading = false,
  onTaskUpdated 
}: TasksListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        لا توجد مهام بعد
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-right">عنوان المهمة</TableHead>
          <TableHead className="text-right">الحالة</TableHead>
          <TableHead className="text-right">الأولوية</TableHead>
          <TableHead className="text-right">تاريخ الاستحقاق</TableHead>
          <TableHead className="text-right">المسؤول</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TaskTableRow 
            key={task.id} 
            task={task} 
            onTaskUpdated={onTaskUpdated} 
          />
        ))}
      </TableBody>
    </Table>
  );
}
