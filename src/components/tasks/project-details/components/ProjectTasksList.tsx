
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddTaskDialog } from "../AddTaskDialog";
import { Task } from "../types/task";
import { EditTaskDialog } from "../EditTaskDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectStagesTabs } from "./stages/ProjectStagesTabs";

interface ProjectTasksListProps {
  projectId: string | undefined;
  stages: { id: string; name: string }[];
  projectMembers: { user_id: string; display_name?: string; email?: string }[];
}

export const ProjectTasksList = ({ projectId, stages, projectMembers }: ProjectTasksListProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  
  const fetchTasks = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTasks();
  }, [projectId]);
  
  const handleAddTask = () => {
    setIsAddDialogOpen(true);
  };
  
  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsEditDialogOpen(true);
  };
  
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);
      
      if (error) throw error;
      
      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };
  
  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      
      // Update local state
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };
  
  const filterTasksByStatus = (status: string) => {
    if (status === "all") return tasks;
    return tasks.filter(task => task.status === status);
  };
  
  if (!projectId) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          لم يتم تحديد مشروع
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">المهام</h2>
        <Button onClick={handleAddTask} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          إضافة مهمة
        </Button>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 grid grid-cols-5 h-auto">
          <TabsTrigger value="all" className="py-2">الكل</TabsTrigger>
          <TabsTrigger value="pending" className="py-2">قيد الانتظار</TabsTrigger>
          <TabsTrigger value="in_progress" className="py-2">قيد التنفيذ</TabsTrigger>
          <TabsTrigger value="completed" className="py-2">مكتملة</TabsTrigger>
          <TabsTrigger value="delayed" className="py-2">متأخرة</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            stages.length > 0 ? (
              <ProjectStagesTabs 
                stages={stages} 
                tasks={filterTasksByStatus(activeTab)} 
                onStatusChange={handleStatusChange}
                onDeleteTask={handleDeleteTask}
                onEditTask={handleEditTask}
              />
            ) : (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-lg">مهام المشروع</CardTitle>
                </CardHeader>
                <CardContent>
                  {filterTasksByStatus(activeTab).length > 0 ? (
                    <div className="space-y-4">
                      {filterTasksByStatus(activeTab).map(task => (
                        <div key={task.id} className="p-4 border rounded-md">
                          <h3 className="font-medium">{task.title}</h3>
                          {task.description && <p className="text-sm mt-1">{task.description}</p>}
                          <div className="flex justify-between mt-2">
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleStatusChange(task.id, 'completed')}
                                disabled={task.status === 'completed'}
                              >
                                إكمال
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleEditTask(task)}
                              >
                                تعديل
                              </Button>
                            </div>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              حذف
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      لا توجد مهام {activeTab !== "all" && "بهذه الحالة"}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          )}
        </TabsContent>
      </Tabs>
      
      <AddTaskDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        projectId={projectId}
        projectStages={stages}
        onTaskAdded={fetchTasks}
        projectMembers={projectMembers}
      />
      
      {taskToEdit && (
        <EditTaskDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          task={taskToEdit}
          projectStages={stages}
          projectMembers={projectMembers}
          onTaskUpdated={fetchTasks}
        />
      )}
    </div>
  );
};
