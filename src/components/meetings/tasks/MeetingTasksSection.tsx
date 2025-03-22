
import { useState } from "react";
import { useMeetingTasks } from "@/hooks/meetings/useMeetingTasks";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Task } from "@/components/tasks/types/task";
import { MeetingTask } from "@/types/meeting";
import { TasksList } from "@/components/tasks/project-details";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateMeetingTask } from "@/hooks/meetings/useCreateMeetingTask";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MeetingTasksSectionProps {
  meetingId: string;
}

// Helper function to convert MeetingTask to Task
const convertMeetingTasksToTasks = (meetingTasks: MeetingTask[]): Task[] => {
  return meetingTasks.map(meetingTask => ({
    id: meetingTask.id,
    title: meetingTask.title,
    description: meetingTask.description || null,
    status: meetingTask.status || "pending",
    priority: "medium", // Default priority since meeting tasks don't have priority
    due_date: meetingTask.due_date || null,
    assigned_to: meetingTask.assigned_to || null,
    created_at: meetingTask.created_at || new Date().toISOString(),
    meeting_id: meetingTask.meeting_id
  }));
};

export const MeetingTasksSection = ({ meetingId }: MeetingTasksSectionProps) => {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const { data: meetingTasks, isLoading, error, refetch } = useMeetingTasks(meetingId);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [taskType, setTaskType] = useState<string>("action_item");
  const [addToGeneralTasks, setAddToGeneralTasks] = useState(false);
  
  // Mutation hook
  const createMeetingTaskMutation = useCreateMeetingTask();
  
  // Convert meeting tasks to the format expected by TasksList
  const tasks = meetingTasks ? convertMeetingTasksToTasks(meetingTasks) : [];

  // Fetch users for the assignee dropdown
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, email');
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleOpenAddTask = () => {
    setIsAddTaskOpen(true);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setAssignedTo("");
    setTaskType("action_item");
    setAddToGeneralTasks(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("عنوان المهمة مطلوب");
      return;
    }
    
    try {
      await createMeetingTaskMutation.mutateAsync({
        meeting_id: meetingId,
        title: title.trim(),
        description: description.trim() || null,
        due_date: dueDate || null,
        assigned_to: assignedTo || null,
        task_type: taskType as any,
        status: "pending",
        add_to_general_tasks: addToGeneralTasks
      });
      
      resetForm();
      setIsAddTaskOpen(false);
      refetch();
      
    } catch (error) {
      console.error("Error adding meeting task:", error);
      toast.error("حدث خطأ أثناء إضافة المهمة");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">المهام</h3>
        <Button 
          onClick={handleOpenAddTask} 
          className="rtl"
          size="sm"
        >
          <Plus className="h-4 w-4 ml-2" />
          إضافة مهمة جديدة
        </Button>
      </div>

      <TasksList 
        isLoading={isLoading} 
        error={error instanceof Error ? error : null}
        onTasksChange={() => refetch()}
        hideAddButton={true}
        externalTasks={tasks}
        meetingId={meetingId}
      />

      {/* Custom Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="sm:max-w-[550px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة مهمة جديدة للاجتماع</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان المهمة*</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أدخل عنوان المهمة"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">وصف المهمة</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="أدخل وصف المهمة"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="taskType">نوع المهمة</Label>
              <Select value={taskType} onValueChange={setTaskType}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع المهمة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="action_item">إجراء</SelectItem>
                  <SelectItem value="follow_up">متابعة</SelectItem>
                  <SelectItem value="decision">قرار</SelectItem>
                  <SelectItem value="preparation">تحضير</SelectItem>
                  <SelectItem value="execution">تنفيذ</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assignedTo">المسؤول عن التنفيذ</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المسؤول عن التنفيذ" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.display_name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse mt-2">
              <input
                type="checkbox"
                id="addToGeneralTasks"
                checked={addToGeneralTasks}
                onChange={(e) => setAddToGeneralTasks(e.target.checked)}
                className="ml-2"
              />
              <Label htmlFor="addToGeneralTasks">إضافة إلى المهام العامة</Label>
            </div>
            
            <div className="flex justify-start gap-2 mt-6">
              <Button type="submit" disabled={createMeetingTaskMutation.isPending}>
                {createMeetingTaskMutation.isPending ? "جاري الإضافة..." : "إضافة المهمة"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddTaskOpen(false)}
                disabled={createMeetingTaskMutation.isPending}
              >
                إلغاء
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
