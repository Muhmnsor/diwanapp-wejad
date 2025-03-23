
import React, { useState } from "react";
import { TasksList } from "@/components/tasks/project-details/TasksList";
import { Task } from "@/components/tasks/types/task";
import { MeetingTask } from "@/types/meeting";
import { EditTaskDialog } from "./EditTaskDialog";
import { Button } from "@/components/ui/button";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { useDeleteMeetingTask } from "@/hooks/meetings/useDeleteMeetingTask";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MeetingTasksListProps {
  tasks: Task[];
  isLoading: boolean;
  error: any;
  onTasksChange: () => void;
  meetingId: string;
  onStatusChange: (taskId: string, status: string) => void;
}

export const MeetingTasksList: React.FC<MeetingTasksListProps> = ({
  tasks,
  isLoading,
  error,
  onTasksChange,
  meetingId,
  onStatusChange
}) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { mutate: deleteTask } = useDeleteMeetingTask();

  // Find the corresponding meeting task for the Task object
  const findMeetingTask = (taskId: string): MeetingTask | undefined => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return undefined;
    
    // Convert Task to MeetingTask
    return {
      id: task.id,
      meeting_id: meetingId,
      title: task.title,
      description: task.description || undefined,
      status: task.status as any,
      priority: task.priority as any,
      due_date: task.due_date || undefined,
      assigned_to: task.assigned_to || undefined,
      created_at: task.created_at,
      created_by: undefined,
      task_type: "action_item", // Default
      requires_deliverable: task.requires_deliverable || false,
      general_task_id: undefined
    };
  };

  const handleEditTask = (taskId: string) => {
    const task = findMeetingTask(taskId);
    if (task) {
      setSelectedTask(task as any);
      setIsEditDialogOpen(true);
    } else {
      toast.error("لم يتم العثور على بيانات المهمة");
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm("هل أنت متأكد من رغبتك في حذف هذه المهمة؟")) {
      deleteTask({ 
        id: taskId, 
        meeting_id: meetingId 
      }, {
        onSuccess: () => {
          onTasksChange();
        }
      });
    }
  };

  // If we're loading or have an error, show appropriate UI
  if (isLoading) {
    return <div className="py-4 text-center">جاري تحميل المهام...</div>;
  }

  if (error) {
    return <div className="py-4 text-center text-red-500">حدث خطأ أثناء تحميل المهام</div>;
  }

  // If there are no tasks, show empty state
  if (!tasks || tasks.length === 0) {
    return <div className="py-4 text-center text-gray-500">لا توجد مهام للاجتماع حتى الآن</div>;
  }

  // Render our custom tasks list
  return (
    <>
      <div className="space-y-4">
        {tasks.map(task => (
          <Card key={task.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-medium mb-1">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                      task.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status === 'completed' ? 'مكتملة' : 
                       task.status === 'in_progress' ? 'قيد التنفيذ' : 
                       task.status === 'cancelled' ? 'ملغية' : 'قيد الانتظار'}
                    </span>
                    
                    {task.priority && (
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority === 'high' ? 'أولوية عالية' : 
                         task.priority === 'medium' ? 'أولوية متوسطة' : 'أولوية منخفضة'}
                      </span>
                    )}
                    
                    {task.due_date && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-800">
                        تاريخ الاستحقاق: {new Date(task.due_date).toLocaleDateString('ar-SA')}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <select 
                    value={task.status}
                    onChange={(e) => onStatusChange(task.id, e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="pending">قيد الانتظار</option>
                    <option value="in_progress">قيد التنفيذ</option>
                    <option value="completed">مكتملة</option>
                    <option value="cancelled">ملغية</option>
                  </select>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTask(task.id)}
                    className="h-8 px-2"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span className="sr-only">تعديل</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTask(task.id)}
                    className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2Icon className="h-4 w-4" />
                    <span className="sr-only">حذف</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {selectedTask && (
        <EditTaskDialog
          meetingId={meetingId}
          task={selectedTask as MeetingTask}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={onTasksChange}
        />
      )}
    </>
  );
};
