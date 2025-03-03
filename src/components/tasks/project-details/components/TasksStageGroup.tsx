
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { Task } from "../types/task";
import { TaskItem } from "./TaskItem";

interface TasksStageGroupProps {
  stage: { id: string; name: string };
  tasks: Task[];
  activeTab: string;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
}

export const TasksStageGroup = ({
  stage,
  tasks,
  activeTab,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange
}: TasksStageGroupProps) => {
  const filteredTasks = tasks.filter(task => 
    activeTab === "all" || task.status === activeTab
  );
  
  if (filteredTasks.length === 0) return null;
  
  return (
    <div className="border rounded-md overflow-hidden" dir="rtl">
      <div className="bg-gray-50 p-3 border-b">
        <h3 className="font-medium">{stage.name}</h3>
      </div>
      <Table dir="rtl">
        <TableHeader>
          <TableRow>
            <TableHead>المهمة</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>الأولوية</TableHead>
            <TableHead>المكلف</TableHead>
            <TableHead>تاريخ الاستحقاق</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              projectId={task.project_id}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
              formatDate={formatDate}
              onStatusChange={onStatusChange}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
