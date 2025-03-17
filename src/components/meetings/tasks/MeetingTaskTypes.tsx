
import { useState } from "react";
import { TabsList, TabsTrigger, Tabs, TabsContent } from "@/components/ui/tabs";
import { MeetingTask } from "@/types/meeting";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, CheckSquare, CalendarClock, ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useMeetingTasks } from "@/hooks/meetings/useMeetingTasks";

interface MeetingTaskTypesProps {
  meetingId: string | undefined;
}

export const MeetingTaskTypes = ({ meetingId }: MeetingTaskTypesProps) => {
  const { data: tasks = [], isLoading, error } = useMeetingTasks(meetingId);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Filter tasks by type
  const preMeetingTasks = tasks.filter(task => task.task_type === 'preparation');
  const duringMeetingTasks = tasks.filter(task => task.task_type === 'execution');
  const postMeetingTasks = tasks.filter(task => task.task_type === 'follow_up');
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>جاري تحميل المهام...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-destructive text-center p-4">
        حدث خطأ أثناء تحميل المهام: {error.message}
      </div>
    );
  }
  
  const renderTaskList = (taskList: MeetingTask[], emptyTitle: string, emptyDescription: string, icon: React.ReactNode) => {
    if (taskList.length === 0) {
      return (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          icon={icon}
          action={
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              إضافة مهمة جديدة
            </Button>
          }
        />
      );
    }
    
    return (
      <div className="space-y-4">
        {taskList.map(task => (
          <Card key={task.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{task.title}</h4>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                  )}
                </div>
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status === 'completed' ? 'مكتمل' :
                     task.status === 'in_progress' ? 'قيد التنفيذ' :
                     task.status === 'cancelled' ? 'ملغي' : 'معلق'}
                  </span>
                </div>
              </div>
              {task.assigned_to && (
                <div className="mt-2 text-xs text-muted-foreground">
                  مسند إلى: {task.assigned_to}
                </div>
              )}
              {task.due_date && (
                <div className="mt-1 text-xs text-muted-foreground">
                  تاريخ الاستحقاق: {new Date(task.due_date).toLocaleDateString('ar-SA')}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">مهام الاجتماع</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          إضافة مهمة
        </Button>
      </div>
      
      <Tabs defaultValue="preparation" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-6">
          <TabsTrigger value="preparation">المهام التحضيرية</TabsTrigger>
          <TabsTrigger value="execution">المهام التنفيذية</TabsTrigger>
          <TabsTrigger value="follow_up">المهام الإلحاقية</TabsTrigger>
        </TabsList>
        
        <TabsContent value="preparation">
          {renderTaskList(
            preMeetingTasks,
            "لا توجد مهام تحضيرية",
            "لم يتم إضافة أي مهام تحضيرية لهذا الاجتماع بعد.",
            <CalendarClock className="h-10 w-10 text-muted-foreground" />
          )}
        </TabsContent>
        
        <TabsContent value="execution">
          {renderTaskList(
            duringMeetingTasks,
            "لا توجد مهام تنفيذية",
            "لم يتم إضافة أي مهام تنفيذية لهذا الاجتماع بعد.",
            <ClipboardList className="h-10 w-10 text-muted-foreground" />
          )}
        </TabsContent>
        
        <TabsContent value="follow_up">
          {renderTaskList(
            postMeetingTasks,
            "لا توجد مهام إلحاقية",
            "لم يتم إضافة أي مهام إلحاقية لهذا الاجتماع بعد.",
            <CheckSquare className="h-10 w-10 text-muted-foreground" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
