import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Task } from "@/components/tasks/types/task";
import { TaskCard } from "@/components/tasks/project-details/components/TaskCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ProjectMember } from "@/components/tasks/project-details/types/projectMember";
import { useProjectMembers } from "@/components/tasks/project-details/hooks/useProjectMembers";

export interface WorkspaceTasksListProps {
  workspaceId: string;
  projectMembers: ProjectMember[];
}

export const WorkspaceTasksList = ({ workspaceId, projectMembers }: WorkspaceTasksListProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  useEffect(() => {
    // Filter tasks based on active tab
    if (activeTab === "all") {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter(task => task.status === activeTab));
    }
  }, [activeTab, tasks]);
  
  const fetchTasks = async () => {
    if (!workspaceId) return;
    
    setIsLoading(true);
    try {
      console.log(`Workspaceing tasks for workspace ${workspaceId}...`);
      
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          profiles:assigned_to (
            display_name,
            email
          ),
          created_by,
          project_manager
        `)
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      console.log(`Retrieved ${data?.length} tasks for workspace`);
      
      // Map the data to include assigned_user_name
      const tasksWithUserNames = data?.map(task => ({
        ...task,
        assigned_user_name: task.profiles?.display_name || task.profiles?.email || null
      })) || [];
      
      setTasks(tasksWithUserNames);
      setFilteredTasks(tasksWithUserNames);
    } catch (error) {
      console.error("Error fetching workspace tasks:", error);
      toast.error("فشل في تحميل مهام مساحة العمل");
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
  
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId);
      
      if (error) throw error;
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
      
      toast.success("تم تحديث حالة المهمة بنجاح");
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("فشل في تحديث حالة المهمة");
    }
  };
  
  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);
      
      if (error) throw error;
      
      // Update local state
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      toast.success("تم حذف المهمة بنجاح");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("فشل في حذف المهمة");
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-9 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>مهام مساحة العمل</CardTitle>
          <Button onClick={handleAddTask}>
            <PlusCircle className="h-4 w-4 mr-2" />
            إضافة مهمة
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="all">الكل</TabsTrigger>
            <TabsTrigger value="pending">
              قيد الانتظار
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              قيد التنفيذ
            </TabsTrigger>
            <TabsTrigger value="completed">
              مكتملة
            </TabsTrigger>
            <TabsTrigger value="delayed">
              متأخرة
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-md border">
            <p className="text-gray-500">لا توجد مهام {activeTab !== "all" ? `بحالة ${activeTab}` : ""}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={handleAddTask}
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              إضافة مهمة جديدة
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTasks.map(task => (
              <TaskCard 
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteTask}
                onEdit={() => {}}
                createdBy={task.created_by}
                projectManager={task.project_manager}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};