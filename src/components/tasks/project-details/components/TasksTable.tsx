
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { Task } from "../types/task";
import { TaskItem } from "./TaskItem";
import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";

interface TasksTableProps {
  tasks: Task[];
  activeTab: string;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId: string;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export const TasksTable = ({
  tasks,
  activeTab,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  projectId,
  onEdit,
  onDelete
}: TasksTableProps) => {
  const filteredTasks = tasks.filter(task => 
    activeTab === "all" || task.status === activeTab
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>المهمة</TableHead>
          <TableHead>الحالة</TableHead>
          <TableHead>الأولوية</TableHead>
          <TableHead>المكلف</TableHead>
          <TableHead>تاريخ الاستحقاق</TableHead>
          <TableHead>الإجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <SortableContext 
          items={filteredTasks.map(task => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              isDraggable={true}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
              formatDate={formatDate}
              onStatusChange={onStatusChange}
              projectId={projectId}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
      </TableBody>
    </Table>
  );
};
