
import { useState, useEffect } from "react";
import { Task } from "./types/task";
import { useAssignedTasks } from "./hooks/useAssignedTasks";
import { TaskListItem } from "./components/TaskListItem";
import { TasksLoadingState } from "./components/TasksLoadingState";
import { TasksEmptyState } from "./components/TasksEmptyState";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Paperclip, Upload, MessageCircle } from "lucide-react";
import { TaskAttachmentDialog } from "./components/dialogs/TaskAttachmentDialog";
import { useAttachmentOperations } from "./hooks/useAttachmentOperations";

export const AssignedTasksList = () => {
  const { tasks, loading, error, refetch } = useAssignedTasks();
  const [showCompleted, setShowCompleted] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { uploadAttachment, isUploading } = useAttachmentOperations(
    undefined, // No delete callback needed
    () => refetch() // Refresh task list after successful upload
  );
  
  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      // التحقق من الجدول المناسب للمهمة
      const task = tasks.find(t => t.id === taskId);
      
      if (!task) return;
      
      if (task.is_subtask) {
        // If it's a subtask, update in the subtasks table
        const { error } = await supabase
          .from('subtasks')
          .update({ status })
          .eq('id', taskId);
          
        if (error) throw error;
      } else {
        // For regular tasks or portfolio tasks
        const isPortfolioTask = task.workspace_id ? true : false;
        const tableName = isPortfolioTask ? 'portfolio_tasks' : 'tasks';
        
        const { error } = await supabase
          .from(tableName)
          .update({ status })
          .eq('id', taskId);
            
        if (error) throw error;
      }
      
      // تحديث القائمة
      refetch();
      
      toast.success('تم تحديث حالة المهمة');
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error('حدث خطأ أثناء تحديث حالة المهمة');
    }
  };
  
  const openAttachmentsDialog = (task: Task) => {
    setSelectedTask(task);
    setIsAttachmentDialogOpen(true);
  };
  
  const openFileUploader = (task: Task) => {
    setSelectedTask(task);
    setIsUploadDialogOpen(true);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile || !selectedTask) return;
    
    // Determine which table the task belongs to
    let taskTable = 'tasks';
    if (selectedTask.is_subtask) {
      taskTable = 'subtasks';
    } else if (selectedTask.workspace_id) {
      taskTable = 'portfolio_tasks';
    }
    
    const success = await uploadAttachment(
      selectedFile, 
      selectedTask.id,
      'assignee', // Category for files uploaded by assignee
      taskTable
    );
    
    if (success) {
      setSelectedFile(null);
      setIsUploadDialogOpen(false);
      refetch(); // Refresh the task list
    }
  };
  
  if (loading) {
    return <TasksLoadingState />;
  }
  
  if (error || tasks.length === 0) {
    return <TasksEmptyState message="لا توجد لديك مهام مسندة حالياً" />;
  }
  
  // Filter out completed tasks unless showCompleted is true
  const filteredTasks = tasks.filter(task => showCompleted || task.status !== 'completed');
  
  // If there are no tasks after filtering
  if (filteredTasks.length === 0) {
    return (
      <>
        <div className="flex justify-end mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowCompleted(!showCompleted)}
            className="text-xs"
          >
            {showCompleted ? 'إخفاء المهام المكتملة' : 'إظهار المهام المكتملة'}
          </Button>
        </div>
        <TasksEmptyState message="لا توجد لديك مهام قيد التنفيذ" />
      </>
    );
  }
  
  return (
    <>
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowCompleted(!showCompleted)}
          className="text-xs"
        >
          {showCompleted ? 'إخفاء المهام المكتملة' : 'إظهار المهام المكتملة'}
        </Button>
      </div>
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div key={task.id}>
            <TaskListItem 
              key={task.id} 
              task={task} 
              onStatusChange={handleStatusChange}
            />
            {/* Task action buttons */}
            <div className="mt-1 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500 ml-2"
                onClick={() => openAttachmentsDialog(task)}
              >
                <Paperclip className="h-3 w-3 ml-1" />
                المرفقات
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500"
                onClick={() => openFileUploader(task)}
              >
                <Upload className="h-3 w-3 ml-1" />
                رفع ملف
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Attachment dialog */}
      {selectedTask && (
        <TaskAttachmentDialog
          task={selectedTask}
          open={isAttachmentDialogOpen}
          onOpenChange={setIsAttachmentDialogOpen}
        />
      )}
      
      {/* File upload dialog */}
      {selectedTask && (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${isUploadDialogOpen ? '' : 'hidden'}`}>
          <div className="bg-white p-4 rounded-md w-96 max-w-full" dir="rtl">
            <h3 className="text-lg font-medium mb-4">رفع ملف للمهمة</h3>
            <p className="text-sm text-gray-500 mb-4">يمكنك رفع ملف واحد في كل مرة</p>
            
            <div className="space-y-4">
              <div>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              
              {selectedFile && (
                <div className="text-sm bg-gray-50 p-2 rounded">
                  {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                </div>
              )}
              
              <div className="flex justify-end space-x-2 space-x-reverse">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsUploadDialogOpen(false);
                    setSelectedFile(null);
                  }}
                >
                  إلغاء
                </Button>
                <Button
                  size="sm"
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                >
                  {isUploading ? 'جاري الرفع...' : 'رفع الملف'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
