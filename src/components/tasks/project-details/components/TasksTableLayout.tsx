
import { Task } from "../types/task";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
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
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>المهمة</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>الأولوية</TableHead>
            <TableHead>تاريخ الاستحقاق</TableHead>
            <TableHead>المكلف</TableHead>
            <TableHead className="text-left">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell>{getStatusBadge(task.status)}</TableCell>
              <TableCell>{getPriorityBadge(task.priority)}</TableCell>
              <TableCell>{formatDate(task.due_date)}</TableCell>
              <TableCell>
                {task.assigned_user_name || "غير محدد"}
              </TableCell>
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
