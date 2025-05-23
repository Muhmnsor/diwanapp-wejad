import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { Task } from "../types/task";
import { TaskItem } from "./TaskItem";
// تم إزالة استيراد SortableContext و verticalListSortingStrategy بناءً على الطلب


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

// src/components/tasks/project-details/components/TasksStageGroup.tsx

// تم إزالة SortableContext من هنا والاعتماد على المكون الأب
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

  if (filteredTasks.length === 0) return null;

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
          {/* تم إزالة SortableContext من هنا */}
          {filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              isDraggable={true} // احتفظنا بها، ولكن قد يتم التحكم بها من الأب الآن
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
              formatDate={formatDate}
              onStatusChange={onStatusChange}
              projectId={projectId}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
