import { useDraftTasksVisibility } from "@/hooks/useDraftTasksVisibility";
import { Task } from "../types/task";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, FileDown, Loader2, MessageCircle, PlusCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TaskDiscussionDialog } from "@/components/tasks/components/TaskDiscussionDialog";

interface TasksWithVisibilityProps {
  tasks: Task[];
  viewMode: "table" | "list";
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId?: string;
  isDraftProject?: boolean;
  isLoading?: boolean;
}

export const TasksWithVisibility = ({
  tasks,
  viewMode,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  projectId,
  isDraftProject = false,
  isLoading = false
}: TasksWithVisibilityProps) => {
  const { visibleTasks, isProjectManager, isDraftProject: isDraft, isLoadingVisibility } = useDraftTasksVisibility(tasks, projectId);
  const [isLaunching, setIsLaunching] = useState(false);
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const showLoading = isLoading || isLoadingVisibility;

  const handleLaunchProject = async () => {
    if (!projectId) return;
    
    try {
      setIsLaunching(true);
      
      const { error: projectError } = await supabase
        .from('project_tasks')
        .update({ is_draft: false })
        .eq('id', projectId);
        
      if (projectError) throw projectError;
      
      const { error: tasksError } = await supabase
        .from('tasks')
        .update({ status: 'pending' })
        .eq('project_id', projectId)
        .eq('status', 'draft');
        
      if (tasksError) throw tasksError;
      
      toast.success("تم إطلاق المشروع بنجاح!");
      
      window.location.reload();
    } catch (error) {
      console.error("Error launching project:", error);
      toast.error("حدث خطأ أثناء إطلاق المشروع");
    } finally {
      setIsLaunching(false);
    }
  };

  const handleShowDiscussion = (task: Task) => {
    setSelectedTask(task);
    setShowDiscussion(true);
  };

  if (showLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-md border">
        <p className="text-gray-500">لا توجد مهام في هذه القائمة</p>
      </div>
    );
  }

  if (isDraftProject && !isProjectManager && tasks.length > 0) {
    return (
      <Alert variant="info" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          هذا المشروع في وضع المسودة. ستظهر المهام بعد إطلاق المشروع.
        </AlertDescription>
      </Alert>
    );
  }

  const draftAlert = isDraftProject && isProjectManager && (
    <Alert variant="info" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex justify-between items-center">
        <span>المشروع في وضع المسودة. جميع المهام في حالة مسودة ولن تكون مرئية للفريق حتى يتم إطلاق المشروع.</span>
        <Button 
          size="sm" 
          onClick={handleLaunchProject}
          disabled={isLaunching}
          className="bg-green-600 hover:bg-green-700 text-white mr-2"
        >
          {isLaunching ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              جاري الإطلاق...
            </>
          ) : (
            "إطلاق المشروع"
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );

  if (viewMode === "table") {
    return (
      <>
        {draftAlert}
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px]">المهمة</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الأولوية</TableHead>
                <TableHead>المكلف</TableHead>
                <TableHead>تاريخ الاستحقاق</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleTasks.length > 0 ? (
                visibleTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                    <TableCell>
                      {task.assigned_user_name ?? 'غير مكلف'}
                      {isDraftProject && task.status === "draft" && (
                        <Badge variant="outline" className="mr-2 bg-blue-50 text-blue-600 border-blue-200">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          مسودة
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(task.due_date)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleShowDiscussion(task)}
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span className="sr-only">مناقشة</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <PlusCircle className="h-4 w-4" />
                          <span className="sr-only">إضافة مهمة فرعية</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <FileDown className="h-4 w-4" />
                          <span className="sr-only">نماذج</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                    لا توجد مهام مطابقة للمعايير المحددة
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {selectedTask && (
          <TaskDiscussionDialog 
            open={showDiscussion} 
            onOpenChange={setShowDiscussion}
            task={selectedTask}
          />
        )}
      </>
    );
  }

  return (
    <>
      {draftAlert}
      <div className="space-y-3">
        {visibleTasks.length > 0 ? (
          visibleTasks.map((task) => (
            <div key={task.id} className="border rounded-md p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-medium">{task.title}</h3>
                {getStatusBadge(task.status)}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">الأولوية: </span>
                  {getPriorityBadge(task.priority)}
                </div>
                <div>
                  <span className="text-gray-500">المكلف: </span>
                  {task.assigned_user_name ?? 'غير مكلف'}
                  {isDraftProject && task.status === "draft" && (
                    <Badge variant="outline" className="mr-2 bg-blue-50 text-blue-600 border-blue-200">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      مسودة
                    </Badge>
                  )}
                </div>
                <div>
                  <span className="text-gray-500">تاريخ الاستحقاق: </span>
                  {formatDate(task.due_date)}
                </div>
              </div>
              <div className="mt-3 border-t pt-3 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs flex items-center gap-1"
                  onClick={() => handleShowDiscussion(task)}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  مناقشة
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs flex items-center gap-1"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  مهمة فرعية
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-md border">
            <p className="text-gray-500">لا توجد مهام مطابقة للمعايير المحددة</p>
          </div>
        )}
      </div>
      
      {selectedTask && (
        <TaskDiscussionDialog 
          open={showDiscussion} 
          onOpenChange={setShowDiscussion}
          task={selectedTask}
        />
      )}
    </>
  );
};
