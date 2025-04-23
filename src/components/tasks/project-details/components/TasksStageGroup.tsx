
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { Task } from "../types/task";
import { TaskItem } from "./TaskItem";
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState } from "react";
import { toast } from "sonner";

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
  updateTaskOrder: (reorderedTasks: Task[]) => Promise<boolean>;
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
  onDelete,
  updateTaskOrder,
}: TasksStageGroupProps) => {
  const filteredTasks = tasks.filter(task =>
    activeTab === "all" || task.status === activeTab
  );

  if (filteredTasks.length === 0) return null;

// تعديل handleDragEnd
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  if (over && active.id !== over.id) {
    const oldIndex = filteredTasks.findIndex(t => t.id === active.id);
    const newIndex = filteredTasks.findIndex(t => t.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const updatedTasks = [...filteredTasks];
    const [movedTask] = updatedTasks.splice(oldIndex, 1);
    updatedTasks.splice(newIndex, 0, movedTask);

    const tasksWithOrder = updatedTasks.map((task, index) => ({
      ...task,
      order_position: index + 1,
      stage_id: stage.id
    }));
    
    updateTaskOrder(tasksWithOrder);
  }
};


  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-gray-50 p-3 border-b">
        <h3 className="font-medium">{stage.name}</h3>
      </div>
      <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
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
              {filteredTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
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
        </SortableContext>
      </DndContext>
    </div>
  );
};
