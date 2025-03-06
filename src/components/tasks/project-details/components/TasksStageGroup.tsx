
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { Task } from "../types/task";
import { TaskItem } from "./TaskItem";

interface TasksStageGroupProps {
  stage: string;
  tasks: Task[];
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId: string;
  onTaskDeleted?: () => void;
  onTaskEdit?: (taskId: string) => void;
}

export const TasksStageGroup = ({
  stage,
  tasks,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  projectId,
  onTaskDeleted,
  onTaskEdit
}: TasksStageGroupProps) => {
  if (tasks.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{stage}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المهمة</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الأولوية</TableHead>
              <TableHead>المكلف</TableHead>
              <TableHead>تاريخ الاستحقاق</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map(task => (
              <TaskItem 
                key={task.id}
                task={task}
                getStatusBadge={getStatusBadge}
                getPriorityBadge={getPriorityBadge}
                formatDate={formatDate}
                onStatusChange={onStatusChange}
                projectId={projectId}
                onTaskDeleted={onTaskDeleted}
                onTaskEdit={onTaskEdit}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
