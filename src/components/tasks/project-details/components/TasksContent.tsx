import { Skeleton } from "@/components/ui/skeleton";
import { Task } from "../types/task";
import { TasksStageGroup } from "./TasksStageGroup";
import { TaskCard } from "./TaskCard";
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { TaskItem } from "./TaskItem";
import { useTaskReorder } from "../hooks/useTaskReorder";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface TasksContentProps {
  isLoading: boolean;
  activeTab: string;
  filteredTasks: Task[];
  projectStages: {
    id: string;
    name: string;
  }[];
  tasksByStage: Record<string, Task[]>;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId?: string | undefined;
  isGeneral?: boolean;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

export const TasksContent = ({
  isLoading,
  activeTab,
  filteredTasks,
  projectStages,
  tasksByStage,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  projectId,
  isGeneral = false,
  onEditTask,
  onDeleteTask
}: TasksContentProps) => {
  const { reorderTasks, isReordering } = useTaskReorder(projectId || '');
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const success = await reorderTasks({
      tasks: filteredTasks,
      activeId: active.id.toString(),
      overId: over.id.toString()
    });

    if (success) {
      toast.success("تم إعادة ترتيب المهام بنجاح");
    }
};


  if (isLoading) {
    return (
      <div className="space-y-3" dir="rtl">
        {[...Array(3)].map((_, index) => <Skeleton key={index} className="h-24 w-full" />)}
      </div>
    );
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-md border" dir="rtl">
        <p className="text-gray-500">لا توجد مهام {activeTab !== "all" && "بهذه الحالة"}</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      {activeTab === "all" && projectStages.length > 0 && !isGeneral ? (
        <div className="space-y-6" dir="rtl">
          {projectStages.map(stage => (
            <TasksStageGroup
              key={stage.id}
              stage={stage}
              tasks={tasksByStage[stage.id] || []}
              activeTab={activeTab}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
              formatDate={formatDate}
              onStatusChange={onStatusChange}
              projectId={projectId || ''}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6" dir="rtl">
          <div className="bg-white rounded-md shadow-sm overflow-hidden border">
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
                      projectId={projectId || ''}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                    />
                  ))}
                </SortableContext>
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </DndContext>
  );
};
