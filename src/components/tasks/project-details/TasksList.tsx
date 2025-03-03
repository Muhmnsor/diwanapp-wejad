
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AddTaskDialog } from "./AddTaskDialog";
import { ProjectStages } from "./ProjectStages";
import { TasksHeader } from "./components/TasksHeader";
import { TasksFilter } from "./components/TasksFilter";
import { TasksContent } from "./components/TasksContent";
import { getStatusBadge, getPriorityBadge, formatDate } from "./utils/taskFormatters";
import { toast } from "sonner";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
  assigned_user_name?: string;
  priority: string | null;
  created_at: string;
  stage_id: string | null;
  stage_name?: string;
}

interface TasksListProps {
  projectId: string | undefined;
}

export const TasksList = ({ projectId }: TasksListProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [projectStages, setProjectStages] = useState<{ id: string; name: string }[]>([]);
  const [tasksByStage, setTasksByStage] = useState<Record<string, Task[]>>({});
  
  const fetchTasks = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      console.log("Fetching tasks for project:", projectId);
      
      // Get tasks
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching tasks:", error);
        throw error;
      }
      
      console.log("Fetched tasks:", data);
      
      // Add stage names by fetching stages separately
      let tasksWithStageNames = [...(data || [])];
      
      // Get all stage IDs used in tasks
      const stageIds = tasksWithStageNames
        .map(task => task.stage_id)
        .filter(id => id !== null) as string[];
      
      // If there are stage IDs, fetch their names
      if (stageIds.length > 0) {
        const { data: stagesData, error: stagesError } = await supabase
          .from('project_stages')
          .select('id, name')
          .in('id', stageIds);
        
        if (!stagesError && stagesData) {
          // Create a map of stage IDs to names
          const stageMap = stagesData.reduce((map: Record<string, string>, stage) => {
            map[stage.id] = stage.name;
            return map;
          }, {});
          
          // Add stage names to tasks
          tasksWithStageNames = tasksWithStageNames.map(task => ({
            ...task,
            stage_name: task.stage_id ? stageMap[task.stage_id] : undefined
          }));
        }
      }
      
      // Add user names for tasks with assignees
      const tasksWithUserData = await Promise.all(tasksWithStageNames.map(async (task) => {
        if (task.assigned_to) {
          // Check if it's a custom assignee
          if (task.assigned_to.startsWith('custom:')) {
            return {
              ...task,
              assigned_user_name: task.assigned_to.replace('custom:', '')
            };
          }
          
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('display_name, email')
            .eq('id', task.assigned_to)
            .single();
          
          if (!userError && userData) {
            return {
              ...task,
              assigned_user_name: userData.display_name || userData.email
            };
          }
        }
        
        return task;
      }));
      
      // Process tasks by stage
      const tasksByStageMap: Record<string, Task[]> = {};
      
      tasksWithUserData.forEach(task => {
        if (task.stage_id) {
          if (!tasksByStageMap[task.stage_id]) {
            tasksByStageMap[task.stage_id] = [];
          }
          tasksByStageMap[task.stage_id].push(task);
        }
      });
      
      setTasks(tasksWithUserData);
      setTasksByStage(tasksByStageMap);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (projectId) {
      fetchTasks();
    }
  }, [projectId]);

  const handleStagesChange = (stages: { id: string; name: string }[]) => {
    setProjectStages(stages);
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) {
        console.error("Error updating task status:", error);
        toast.error("حدث خطأ أثناء تحديث حالة المهمة");
        return;
      }

      // Update local state to reflect the change
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: newStatus } 
            : task
        )
      );

      // Update tasksByStage state
      setTasksByStage(prevTasksByStage => {
        const newTasksByStage = { ...prevTasksByStage };
        
        // Update the task status in each stage
        Object.keys(newTasksByStage).forEach(stageId => {
          newTasksByStage[stageId] = newTasksByStage[stageId].map(task => 
            task.id === taskId 
              ? { ...task, status: newStatus } 
              : task
          );
        });
        
        return newTasksByStage;
      });

      toast.success(newStatus === 'completed' 
        ? "تم إكمال المهمة بنجاح" 
        : "تم تحديث حالة المهمة");
    } catch (error) {
      console.error("Error in handleStatusChange:", error);
      toast.error("حدث خطأ أثناء تحديث حالة المهمة");
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (activeTab === "all") return true;
    return task.status === activeTab;
  });

  return (
    <>
      <ProjectStages 
        projectId={projectId} 
        onStagesChange={handleStagesChange} 
      />
      
      <Card className="border shadow-sm">
        <CardHeader className="pb-0">
          <TasksHeader onAddTask={() => setIsAddDialogOpen(true)} />
        </CardHeader>
        
        <CardContent className="pt-4">
          <TasksFilter 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
          
          <Tabs value={activeTab}>
            <TabsContent value={activeTab} className="mt-0" dir="rtl">
              <TasksContent 
                isLoading={isLoading}
                activeTab={activeTab}
                filteredTasks={filteredTasks}
                projectStages={projectStages}
                tasksByStage={tasksByStage}
                getStatusBadge={getStatusBadge}
                getPriorityBadge={getPriorityBadge}
                formatDate={formatDate}
                onStatusChange={handleStatusChange}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <AddTaskDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        projectId={projectId}
        projectStages={projectStages}
        onSuccess={fetchTasks}
      />
    </>
  );
};
