
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Task } from "../types/task";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";

interface TasksTableLayoutProps {
  tasks: Task[];
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId: string;
}

export const TasksTableLayout = ({
  tasks,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  projectId
}: TasksTableLayoutProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>عنوان المهمة</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>الأولوية</TableHead>
            <TableHead>تاريخ الاستحقاق</TableHead>
            <TableHead>الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map(task => (
            <TableRow key={task.id}>
              <TableCell className="font-medium max-w-xs">
                <div className="truncate" title={task.title}>{task.title}</div>
                {task.description && (
                  <div className="text-xs text-gray-500 truncate mt-1" title={task.description}>
                    {task.description}
                  </div>
                )}
              </TableCell>
              <TableCell>{getStatusBadge(task.status)}</TableCell>
              <TableCell>{getPriorityBadge(task.priority)}</TableCell>
              <TableCell>{formatDate(task.due_date)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Link to={`/tasks/task/${task.id}?projectId=${projectId}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => onStatusChange(task.id, "completed")}
                        disabled={task.status === "completed"}
                      >
                        تحديد كمكتملة
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onStatusChange(task.id, "in_progress")}
                        disabled={task.status === "in_progress"}
                      >
                        تحديد قيد التنفيذ
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onStatusChange(task.id, "pending")}
                        disabled={task.status === "pending"}
                      >
                        تحديد قيد الانتظار
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
