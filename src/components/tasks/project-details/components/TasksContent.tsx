
import { Skeleton } from "@/components/ui/skeleton";
import { Task } from "../types/task";
import { TasksStageGroup } from "./TasksStageGroup";
import { TaskCard } from "./TaskCard";
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { TaskItem } from "./TaskItem";

interface TasksContentProps {
  isLoading: boolean;
  activeTab: string;
  filteredTasks: Task[];
  projectStages: {
    id: string;
    name: string;
  }[];
  tasksByStage: Record<string, Task[]>;
  setTasksByStage: React.Dispatch<React.SetStateAction<Record<string, Task[]>>>;
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
  setTasksByStage,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  projectId,
  isGeneral = false,
  onEditTask,
  onDeleteTask
}: TasksContentProps) => {
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

  // إذا كان التبويب النشط هو "الكل" وليست مهام عامة، فسنعرض المهام مقسمة حسب المراحل
  if (activeTab === "all" && projectStages.length > 0 && !isGeneral) {
    return (
      <div className="space-y-6" dir="rtl">
        {projectStages.map(stage => (
          <TasksStageGroup 
            key={stage.id} 
            stage={stage} 
            tasks={filteredTasks} 
            activeTab={activeTab} 
            getStatusBadge={getStatusBadge} 
            getPriorityBadge={getPriorityBadge} 
            formatDate={formatDate} 
            onStatusChange={onStatusChange} 
            projectId={projectId || ''} 
            tasksByStage={tasksByStage}
            setTasksByStage={setTasksByStage}
            onEdit={onEditTask} 
            onDelete={onDeleteTask} 
          />
        ))}
      </div>
    );
  }

  // عرض المهام كقائمة بدون تقسيم للتبويبات الأخرى أو المهام العامة
  return (
    <div className="space-y-6" dir="rtl">
      <div className="bg-white rounded-md shadow-sm overflow-hidden border">
        <div className="border rounded-md overflow-hidden">
          <Table dir="rtl">
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
                  projectId={projectId || ''} 
                  onEdit={onEditTask} 
                  onDelete={onDeleteTask} 
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
