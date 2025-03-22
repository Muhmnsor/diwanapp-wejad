
import { useState } from "react";
import { useMeetingTasks } from "@/hooks/meetings/useMeetingTasks";
import { useUpdateMeetingTask } from "@/hooks/meetings/useUpdateMeetingTask";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Check, RotateCcw, ExternalLink } from "lucide-react";
import { AddTaskDialog } from "./AddTaskDialog";
import { EditTaskDialog } from "./EditTaskDialog";
import { MeetingTask, TaskType } from "@/types/meeting";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TasksListProps {
  meetingId: string;
}

export const TasksList = ({ meetingId }: TasksListProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MeetingTask | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  
  const { data: tasks, isLoading, refetch } = useMeetingTasks(meetingId);
  const { mutate: updateTask } = useUpdateMeetingTask();
  
  const handleStatusChange = (task: MeetingTask, newStatus: "pending" | "in_progress" | "completed" | "cancelled") => {
    updateTask({
      id: task.id,
      meeting_id: meetingId,
      updates: {
        status: newStatus
      }
    });
  };
  
  const handleEditTask = (task: MeetingTask) => {
    setSelectedTask(task);
    setIsEditDialogOpen(true);
  };
  
  const handleOpenInTasksApp = async (task: MeetingTask) => {
    if (task.general_task_id) {
      // Navigate to the task in the general tasks app
      window.open(`/tasks#taskId=${task.general_task_id}`, '_blank');
    } else {
      // If no general task exists yet, create one
      try {
        const { data: user } = await supabase.auth.getUser();
        
        if (!user?.user?.id) {
          toast.error("يجب تسجيل الدخول لإضافة المهمة إلى نظام المهام");
          return;
        }
        
        const { data: generalTask, error } = await supabase
          .from('tasks')
          .insert({
            title: task.title,
            description: task.description || '',
            status: task.status,
            priority: 'medium',
            due_date: task.due_date,
            assigned_to: task.assigned_to,
            is_general: true,
            category: task.task_type,
            created_by: user.user.id,
            requires_deliverable: false,
            meeting_task_id: task.id
          })
          .select()
          .single();
          
        if (error) {
          console.error("Error creating general task:", error);
          toast.error("حدث خطأ أثناء إضافة المهمة إلى نظام المهام");
          return;
        }
        
        // Update the meeting task with the general task ID
        const { error: updateError } = await supabase
          .from('meeting_tasks')
          .update({ general_task_id: generalTask.id })
          .eq('id', task.id);
          
        if (updateError) {
          console.error("Error updating meeting task:", updateError);
        } else {
          refetch();
        }
        
        // Navigate to the task in the general tasks app
        window.open(`/tasks#taskId=${generalTask.id}`, '_blank');
        
        toast.success("تم إضافة المهمة إلى نظام المهام بنجاح");
      } catch (e) {
        console.error("Error in creating general task:", e);
        toast.error("حدث خطأ أثناء إضافة المهمة إلى نظام المهام");
      }
    }
  };
  
  const filteredTasks = tasks?.filter(task => {
    if (activeTab === "all") return true;
    if (activeTab === "preparation") return task.task_type === "preparation";
    if (activeTab === "execution") return task.task_type === "execution";
    if (activeTab === "follow_up") return task.task_type === "follow_up";
    if (activeTab === "other") return ["action_item", "decision", "other"].includes(task.task_type);
    return task.status === activeTab;
  });
  
  const getTaskTypeBadge = (type: TaskType) => {
    switch (type) {
      case "preparation":
        return <Badge variant="outline" className="bg-blue-50">تحضيرية</Badge>;
      case "execution":
        return <Badge variant="outline" className="bg-green-50">تنفيذية</Badge>;
      case "follow_up":
        return <Badge variant="outline" className="bg-purple-50">متابعة</Badge>;
      case "action_item":
        return <Badge variant="outline" className="bg-orange-50">إجراء</Badge>;
      case "decision":
        return <Badge variant="outline" className="bg-red-50">قرار</Badge>;
      default:
        return <Badge variant="outline">أخرى</Badge>;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-gray-100">قيد الانتظار</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-blue-100">قيد التنفيذ</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100">مكتمل</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-100">ملغي</Badge>;
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };
  
  const isGeneralTaskLinked = (task: MeetingTask) => !!task.general_task_id;
  
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>المهام</CardTitle>
        <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 ml-2" />
          إضافة مهمة
        </Button>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-7">
            <TabsTrigger value="all">الكل</TabsTrigger>
            <TabsTrigger value="preparation">تحضيرية</TabsTrigger>
            <TabsTrigger value="execution">تنفيذية</TabsTrigger>
            <TabsTrigger value="follow_up">متابعة</TabsTrigger>
            <TabsTrigger value="pending">قيد الانتظار</TabsTrigger>
            <TabsTrigger value="in_progress">قيد التنفيذ</TabsTrigger>
            <TabsTrigger value="completed">مكتملة</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTasks && filteredTasks.length > 0 ? (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div key={task.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium">{task.title}</h3>
                    {task.general_task_id && (
                      <Badge variant="outline" className="mr-2 bg-yellow-50">
                        مرتبط بنظام المهام
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    {getTaskTypeBadge(task.task_type)}
                    {getStatusBadge(task.status)}
                  </div>
                </div>
                
                {task.description && (
                  <p className="text-gray-700 mb-4">{task.description}</p>
                )}
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                  {task.assigned_to && (
                    <div>
                      <span className="font-medium">المسؤول: </span>
                      {task.assigned_to}
                    </div>
                  )}
                  
                  {task.due_date && (
                    <div>
                      <span className="font-medium">تاريخ الاستحقاق: </span>
                      {format(new Date(task.due_date), "dd MMMM yyyy", { locale: ar })}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTask(task)}
                    >
                      <Pencil className="h-4 w-4 ml-1" />
                      تعديل
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenInTasksApp(task)}
                      className={isGeneralTaskLinked(task) ? "bg-yellow-50" : ""}
                    >
                      <ExternalLink className="h-4 w-4 ml-1" />
                      {isGeneralTaskLinked(task) ? "عرض في نظام المهام" : "إضافة لنظام المهام"}
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse">
                    {task.status !== "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-50"
                        onClick={() => handleStatusChange(task, "completed")}
                      >
                        <Check className="h-4 w-4 ml-1" />
                        اكتمال
                      </Button>
                    )}
                    
                    {task.status !== "in_progress" && task.status !== "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-blue-50"
                        onClick={() => handleStatusChange(task, "in_progress")}
                      >
                        <RotateCcw className="h-4 w-4 ml-1" />
                        قيد التنفيذ
                      </Button>
                    )}
                    
                    {task.status === "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(task, "in_progress")}
                      >
                        <RotateCcw className="h-4 w-4 ml-1" />
                        إعادة فتح
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            لا توجد مهام. قم بإضافة مهام جديدة.
          </div>
        )}
      </CardContent>
      
      <AddTaskDialog
        meetingId={meetingId}
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={() => refetch()}
      />
      
      {selectedTask && (
        <EditTaskDialog
          meetingId={meetingId}
          task={selectedTask}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={() => refetch()}
        />
      )}
    </Card>
  );
};
