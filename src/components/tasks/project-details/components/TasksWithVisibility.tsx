
import { useDraftTasksVisibility } from "@/hooks/useDraftTasksVisibility";
import { Task } from "../types/task";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface TasksWithVisibilityProps {
  tasks: Task[];
  viewMode: "table" | "list";
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId?: string;
  isDraftProject?: boolean;
}

export const TasksWithVisibility = ({
  tasks,
  viewMode,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  projectId,
  isDraftProject
}: TasksWithVisibilityProps) => {
  const { visibleTasks, isProjectManager, isDraftProject: isDraft } = useDraftTasksVisibility(tasks, projectId);
  
  // Use provided isDraftProject if available, otherwise use the one from the hook
  const actuallyDraftProject = isDraftProject !== undefined ? isDraftProject : isDraft;
  
  // Show draft mode warning for project managers
  const showDraftWarning = actuallyDraftProject && isProjectManager;
  
  // No tasks to display for regular users in draft projects
  if (actuallyDraftProject && !isProjectManager && tasks.length > 0) {
    return (
      <Alert className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          هذا المشروع في وضع المسودة. سيتم إظهار المهام عند إطلاق المشروع.
        </AlertDescription>
      </Alert>
    );
  }

  // No tasks to display
  if (visibleTasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">لا توجد مهام في هذا المشروع.</p>
      </div>
    );
  }

  return (
    <div>
      {showDraftWarning && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            هذا المشروع في وضع المسودة. المهام غير مرئية للأعضاء الآن. استخدم زر "إطلاق المشروع" عندما تكون جاهزاً.
          </AlertDescription>
        </Alert>
      )}

      {viewMode === "table" ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">عنوان المهمة</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الأولوية</TableHead>
              <TableHead>تاريخ الاستحقاق</TableHead>
              <TableHead>تم تعيينها إلى</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>{getStatusBadge(task.status)}</TableCell>
                <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                <TableCell>{formatDate(task.due_date)}</TableCell>
                <TableCell>{task.assigned_user_name || 'غير معين'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleTasks.map((task) => (
            <div key={task.id} className="bg-card border rounded-lg p-4">
              <div className="flex flex-col h-full">
                <div className="mb-2">
                  <h3 className="font-medium">{task.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {getStatusBadge(task.status)}
                  {task.priority && getPriorityBadge(task.priority)}
                </div>
                <div className="mt-auto pt-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>الاستحقاق: {formatDate(task.due_date)}</span>
                    <span>{task.assigned_user_name || 'غير معين'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
