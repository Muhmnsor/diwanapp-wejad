import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody
} from "@/components/ui/table";

import { Task } from "../types/task";
import { TaskItem } from "./TaskItem";

import { DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";

import { supabase } from "@/integrations/supabase/client";
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
  const filteredTasks = tasks.filter(
    (task) => activeTab === "all" || task.status === activeTab
  );

  if (filteredTasks.length === 0) return null;

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const { error } = await supabase.rpc("update_task_order", {
      task_id: active.id,
      new_position: over.data.current?.sortable?.index
    });

    if (error) {
      toast.error("حدث خطأ أثناء تحديث الترتيب");
    }
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-gray-50 p-3 border-b">
        <h3 className="font-medium">{stage.name}</h3>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <SortableContext
          items={filteredTasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
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
              {filteredTasks.map((task) => (
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
