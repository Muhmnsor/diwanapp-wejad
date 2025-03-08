
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Task } from "../../project-details/types/task";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskCard } from "../../project-details/components/TaskCard";
import { AddTaskDialog } from "../../project-details/AddTaskDialog";
import { EditTaskDialog } from "../../project-details/EditTaskDialog";

interface WorkspaceTasksListProps {
  workspaceId: string | undefined;
  projectMembers: { user_id: string; display_name?: string; email?: string }[];
}

export const WorkspaceTasksList = ({ workspaceId, projectMembers }: WorkspaceTasksListProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  
  const fetchTasks = async () => {
    if (!workspaceId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, profiles:assigned_to(display_name)')
        .eq('workspace_id', workspaceId)
        .is('project_id', null)  // Only fetch tasks not assigned to a project
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to match the Task interface
      const transformedTasks = data.map(task => ({
        ...task,
        assignee_name: task.profiles?.display_name || null
      }));
      
      setTasks(transformedTasks);
    } catch (error) {
      console.error("Error fetching workspace tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTasks();
  }, [workspaceId]);
  
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
  
  if (!workspaceId) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          لم يتم تحديد مساحة العمل
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">مهام مساحة العمل</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : filterTasksByStatus(activeTab).length > 0 ? (
                <div className="space-y-4">
                  {filterTasksByStatus(activeTab).map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onStatusChange={handleStatusChange}
                      onDelete={handleDeleteTask}
                      onEdit={handleEditTask}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  لا توجد مهام {activeTab !== "all" && "بهذه الحالة"}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <AddTaskDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        workspaceId={workspaceId}
        projectId={undefined}
        projectStages={[]}
        onTaskAdded={fetchTasks}
        projectMembers={projectMembers}
      />
      
      {taskToEdit && (
        <EditTaskDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          task={taskToEdit}
          projectStages={[]}
          projectMembers={projectMembers}
          onTaskUpdated={fetchTasks}
        />
      )}
    </div>
  );
};
