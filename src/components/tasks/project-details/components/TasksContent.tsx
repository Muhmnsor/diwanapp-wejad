
import { Skeleton } from "@/components/ui/skeleton";
import { Task } from "../types/task";
import { TasksStageGroup } from "./TasksStageGroup";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { TaskItem } from "./TaskItem";
import { useState } from "react";
import { Paperclip } from "lucide-react";
import { TaskAttachmentDialog } from "../../components/dialogs/TaskAttachmentDialog";

interface TasksContentProps {
  isLoading: boolean;
  activeTab: string;
  filteredTasks: Task[];
  projectStages: { id: string; name: string }[];
  tasksByStage: Record<string, Task[]>;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId: string | undefined;
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
  projectId
}: TasksContentProps) => {
  const [showAttachments, setShowAttachments] = useState<string | null>(null);
  
  if (isLoading) {
    return (
      <div className="space-y-3" dir="rtl">
        {[...Array(3)].map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
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

  // إذا كان التبويب النشط هو "الكل"، فسنعرض المهام مقسمة حسب المراحل
  if (activeTab === "all" && projectStages.length > 0) {
    return (
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
          />
        ))}
      </div>
    );
  }

  // عرض المهام كقائمة بدون تقسيم للتبويبات الأخرى
  return (
    <div className="space-y-6" dir="rtl">
      <div className="bg-white rounded-md shadow-sm overflow-hidden border">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="font-medium">المهام</h3>
        </div>
        <div className="overflow-x-auto">
          <Table dir="rtl">
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">المهمة</TableHead>
                <TableHead className="w-1/6">الحالة</TableHead>
                <TableHead className="w-1/6">الأولوية</TableHead>
                <TableHead className="w-1/6">المكلف</TableHead>
                <TableHead className="w-1/6">تاريخ الاستحقاق</TableHead>
                <TableHead className="w-[80px] text-center">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map(task => (
                <TableRow key={task.id}>
                  <TaskItem
                    key={task.id}
                    task={task}
                    getStatusBadge={getStatusBadge}
                    getPriorityBadge={getPriorityBadge}
                    formatDate={formatDate}
                    onStatusChange={onStatusChange}
                    projectId={projectId || ''}
                  />
                  <TableCell className="text-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="px-2 mr-1"
                      onClick={() => setShowAttachments(task.id)}
                    >
                      <Paperclip className="h-4 w-4 text-gray-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {showAttachments && (
        <TaskAttachmentDialog
          task={filteredTasks.find(t => t.id === showAttachments) || filteredTasks[0]}
          open={!!showAttachments}
          onOpenChange={(open) => {
            if (!open) setShowAttachments(null);
          }}
        />
      )}
    </div>
  );
};
