
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { Task } from "../../project-details/types/task";
import { TaskCard } from "../../project-details/components/TaskCard";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkspaceAddTaskDialog } from "./WorkspaceAddTaskDialog";
import { ProjectMember } from "../../project-details/hooks/useProjectMembers";

interface WorkspaceTasksListProps {
  workspaceId: string;
  workspaceMembers: ProjectMember[];
}

export const WorkspaceTasksList = ({ workspaceId, workspaceMembers }: WorkspaceTasksListProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  useEffect(() => {
    fetchTasks();
  }, [workspaceId]);
  
  useEffect(() => {
    if (activeTab === "all") {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter(task => task.status === activeTab));
    }
  }, [tasks, activeTab]);
  
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching tasks for workspace:", workspaceId);
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          description,
          status,
          priority,
          due_date,
          assigned_to,
          created_at,
          is_general,
          category,
          profiles:assigned_to (display_name, email)
        `)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching tasks:", error);
        toast.error("فشل في تحميل المهام");
        return;
      }
      
      if (data) {
        console.log("Fetched tasks:", data);
        
        // Transform the data to match the Task type
        const transformedTasks = data.map(task => ({
          ...task,
          assigned_user_name: task.profiles ? task.profiles.display_name || task.profiles.email : null,
        }));
        
        setTasks(transformedTasks);
        setFilteredTasks(transformedTasks);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("حدث خطأ أثناء تحميل المهام");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);
      
      if (error) {
        console.error("Error updating task status:", error);
        toast.error("فشل في تحديث حالة المهمة");
        return;
      }
      
      toast.success("تم تحديث حالة المهمة بنجاح");
      fetchTasks();
    } catch (error) {
      console.error("Error:", error);
      toast.error("حدث خطأ أثناء تحديث حالة المهمة");
    }
  };
  
  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) {
        console.error("Error deleting task:", error);
        toast.error("فشل في حذف المهمة");
        return;
      }
      
      toast.success("تم حذف المهمة بنجاح");
      fetchTasks();
    } catch (error) {
      console.error("Error:", error);
      toast.error("حدث خطأ أثناء حذف المهمة");
    }
  };
  
  const handleEditTask = (task: Task) => {
    console.log("Edit task:", task);
    // TODO: Implement task editing functionality
  };
  
  const handleTaskAdded = async () => {
    await fetchTasks();
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4" dir="rtl">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-9 w-32" />
        </div>
        
        <Skeleton className="h-12 w-full" />
        
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">مهام مساحة العمل</h2>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          إضافة مهمة
        </Button>
      </div>
      
      <div className="mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all">جميع المهام ({tasks.length})</TabsTrigger>
            <TabsTrigger value="pending">
              قيد الانتظار ({tasks.filter(t => t.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              قيد التنفيذ ({tasks.filter(t => t.status === 'in_progress').length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              مكتملة ({tasks.filter(t => t.status === 'completed').length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border">
          <p className="text-gray-500">لا توجد مهام {activeTab !== "all" && "بهذه الحالة"}</p>
          {activeTab === "all" && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              إضافة مهمة جديدة
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteTask}
              onEdit={handleEditTask}
            />
          ))}
        </div>
      )}
      
      <WorkspaceAddTaskDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        workspaceId={workspaceId}
        onTaskAdded={handleTaskAdded}
        projectMembers={workspaceMembers}
      />
    </div>
  );
};
