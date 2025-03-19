
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { AddTaskDialog } from "./AddTaskDialog";
import { MeetingTask } from "@/types/meeting";

interface MeetingTaskTypesProps {
  meetingId: string | undefined;
  tasks?: MeetingTask[];
  isLoading?: boolean;
  error?: Error;
}

export const MeetingTaskTypes = ({ 
  meetingId, 
  tasks = [], 
  isLoading = false,
  error
}: MeetingTaskTypesProps) => {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("all");
  
  const filteredTasks = selectedType === "all" 
    ? tasks 
    : tasks.filter(task => task.task_type === selectedType);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">مهام الاجتماع</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">مهام الاجتماع</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-destructive">
            حدث خطأ أثناء تحميل المهام. يرجى المحاولة مرة أخرى.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">مهام الاجتماع</CardTitle>
          <Button 
            size="sm" 
            onClick={() => setIsAddTaskOpen(true)} 
            disabled={!meetingId}
          >
            <Plus className="h-4 w-4 ml-1" />
            إضافة مهمة
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedType} onValueChange={setSelectedType}>
            <TabsList className="mb-4 grid grid-cols-5">
              <TabsTrigger value="all">الكل</TabsTrigger>
              <TabsTrigger value="preparation">التحضير</TabsTrigger>
              <TabsTrigger value="execution">التنفيذ</TabsTrigger>
              <TabsTrigger value="follow_up">المتابعة</TabsTrigger>
              <TabsTrigger value="action_item">إجراءات</TabsTrigger>
            </TabsList>
            
            <TabsContent value={selectedType}>
              {filteredTasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  لا توجد مهام {selectedType !== "all" ? "من هذا النوع" : ""} حالياً
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredTasks.map(task => (
                    <div key={task.id} className="border p-3 rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          {task.description && (
                            <p className="text-muted-foreground text-sm mt-1">{task.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            task.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {task.status === 'completed' ? 'مكتمل' :
                             task.status === 'in_progress' ? 'قيد التنفيذ' :
                             task.status === 'cancelled' ? 'ملغي' :
                             'معلق'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <AddTaskDialog 
        open={isAddTaskOpen} 
        onOpenChange={setIsAddTaskOpen} 
        meetingId={meetingId as string} 
      />
    </>
  );
};
