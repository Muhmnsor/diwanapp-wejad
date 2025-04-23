import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { Task } from "../types/task";
import { TaskItem } from "./TaskItem";
import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";

interface TasksStageGroupProps {
  stage: { id: string; name: string };
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

export const TasksStageGroup = ({
  stage,
  tasks,
  activeTab,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  projectId,
  onEdit,
  onDelete
}: TasksStageGroupProps) => {
  const filteredTasks = tasks.filter(task => 
    activeTab === "all" || task.status === activeTab
  );

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.order_position && b.order_position) {
      return a.order_position - b.order_position;
    }
    if (a.order_position) return -1;
    if (b.order_position) return 1;
    return 0;
  });

  if (sortedTasks.length === 0) return null;

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-gray-50 p-3 border-b">
        <h3 className="font-medium">{stage.name}</h3>
      </div>
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
            items={sortedTasks.map(task => task.id)}
            strategy={verticalListSortingStrategy}
          >
            {sortedTasks.map(task => (
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
                stageId={stage.id}
              />
            ))}
          </SortableContext>
        </TableBody>
      </Table>
    </div>
  );
};
