
import { useState } from "react";
import { Task } from "../types/task";
import { TaskItem } from "./TaskItem";
import { TaskCard } from "./TaskCard";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableBody, TableCell, TableHead, TableHeader, TableRow, Table } from "@/components/ui/table";

interface TasksStageGroupProps {
  stage: {
    id: string;
    name: string;
  };
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

// Helper component to make a task item sortable
const SortableTaskItem = ({ task, getStatusBadge, getPriorityBadge, formatDate, onStatusChange, projectId, onEdit, onDelete, id }: TaskItemProps & { id: string }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab ${isDragging ? 'bg-accent' : ''}`}
    >
      <TaskTableRow task={task} />
    </TableRow>
  );
};

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
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setLocalTasks((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
      
      // Here you would typically update the order in the database
      console.log(`Task ${active.id} moved to position ${over.id}`);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium">{stage.name}</h3>
        <span className="text-sm text-muted-foreground">{localTasks.length} مهمة</span>
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <Table dir="rtl">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">المهمة</TableHead>
              <TableHead className="w-[12%]">الحالة</TableHead>
              <TableHead className="w-[12%]">الأولوية</TableHead>
              <TableHead className="w-[15%]">تاريخ الاستحقاق</TableHead>
              <TableHead className="w-[15%]">تاريخ الإنشاء</TableHead>
              <TableHead className="w-[10%]">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={localTasks.map(task => task.id)}
                strategy={verticalListSortingStrategy}
              >
                {localTasks.map((task) => (
                  <SortableTaskItem
                    key={task.id}
                    id={task.id}
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
              </SortableContext>
            </DndContext>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
