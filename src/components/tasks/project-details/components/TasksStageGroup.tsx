
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Task } from "../types/task";
import { TaskItem } from "./TaskItem";
import { TaskAttachmentButton } from "./TaskAttachmentButton";

interface TasksStageGroupProps {
  stage: { id: string; name: string };
  tasks: Task[];
  activeTab: string;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId: string;
}

export const TasksStageGroup = ({
  stage,
  tasks,
  activeTab,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  projectId
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
            <TableHead className="w-[40%]">المهمة</TableHead>
            <TableHead className="w-[12%]">الحالة</TableHead>
            <TableHead className="w-[12%]">الأولوية</TableHead>
            <TableHead className="w-[15%]">المكلف</TableHead>
            <TableHead className="w-[15%]">تاريخ الاستحقاق</TableHead>
            <TableHead className="w-[6%]">المرفقات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTasks.map(task => (
            <TableRow key={task.id}>
              <TableCell colSpan={5} className="p-0 border-b">
                <TaskItem
                  task={task}
                  getStatusBadge={getStatusBadge}
                  getPriorityBadge={getPriorityBadge}
                  formatDate={formatDate}
                  onStatusChange={onStatusChange}
                  projectId={projectId}
                />
              </TableCell>
              <TableCell className="text-center">
                <TaskAttachmentButton taskId={task.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
