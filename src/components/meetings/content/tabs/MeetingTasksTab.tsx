
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ClipboardList, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/components/tasks/project-details/types/task";
import { ProjectTasksList } from "@/components/tasks/project-details/ProjectTasksList";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { AddTaskDialog } from "@/components/tasks/project-details/AddTaskDialog";
import { TasksList } from "@/components/tasks/project-details/TasksList";

interface MeetingTasksTabProps {
  meetingId: string;
}

export const MeetingTasksTab: React.FC<MeetingTasksTabProps> = ({ meetingId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [meetingTasks, setMeetingTasks] = useState<Task[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { user } = useAuthStore();
  
  // Fetch meeting-related tasks from the tasks table
  const fetchMeetingTasks = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching meeting tasks for meeting ID:", meetingId);
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          profiles:assigned_to (display_name, email),
          stage:stage_id (name)
        `)
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching meeting tasks:", error);
        toast.error("حدث خطأ أثناء تحميل مهام الاجتماع");
        setIsLoading(false);
        return;
      }
      
      // Process the tasks with assigned user info
      const transformedTasks = data.map(task => {
        // Safely extract the assigned user name
        let assignedUserName = '';
        if (task.profiles) {
          assignedUserName = task.profiles.display_name || task.profiles.email || '';
        }

        // Safely extract stage name
        let stageName = '';
        if (task.stage) {
          stageName = task.stage.name || '';
        }

        return {
          ...task,
          assigned_user_name: assignedUserName,
          stage_name: stageName
        };
      });
      
      console.log("Retrieved meeting tasks:", transformedTasks);
      setMeetingTasks(transformedTasks);
      setIsLoading(false);
    } catch (err) {
      console.error("Error in fetchMeetingTasks:", err);
      toast.error("حدث خطأ أثناء تحميل مهام الاجتماع");
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (meetingId) {
      fetchMeetingTasks();
    }
  }, [meetingId]);
  
  const handleAddTask = () => {
    setIsAddDialogOpen(true);
  };
  
  // If we're still loading, show a loading indicator
  if (isLoading) {
    return (
      <Card dir="rtl">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle>مهام الاجتماع</CardTitle>
          <Button variant="outline" size="sm" onClick={handleAddTask}>
            <PlusCircle className="h-4 w-4 ml-1" />
            إضافة مهمة
          </Button>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }
  
  // If we have no tasks yet, show the empty state
  if (meetingTasks.length === 0) {
    return (
      <Card dir="rtl">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle>مهام الاجتماع</CardTitle>
          <Button variant="outline" size="sm" onClick={handleAddTask}>
            <PlusCircle className="h-4 w-4 ml-1" />
            إضافة مهمة
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8" dir="rtl">
            <ClipboardList className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium mb-2">مهام الاجتماع</h3>
            <p className="text-gray-500 mb-6">
              يمكنك إضافة وإدارة المهام المرتبطة بهذا الاجتماع.
              ستظهر هذه المهام أيضًا في صفحة المهام العامة.
            </p>
            <Button variant="outline" onClick={handleAddTask}>
              <PlusCircle className="h-4 w-4 ml-1" />
              إضافة مهمة جديدة
            </Button>
          </div>
        </CardContent>
        
        <AddTaskDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          projectId=""
          projectStages={[]}
          onTaskAdded={fetchMeetingTasks}
          projectMembers={[]}
          isGeneral={true}
          meetingId={meetingId}
          isWorkspace={false}
        />
      </Card>
    );
  }
  
  // If we have tasks, use the TasksList component to show them
  return (
    <Card dir="rtl">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle>مهام الاجتماع</CardTitle>
        <Button variant="outline" size="sm" onClick={handleAddTask}>
          <PlusCircle className="h-4 w-4 ml-1" />
          إضافة مهمة
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <TasksList 
            meetingId={meetingId}
          />
        </div>
      </CardContent>
      
      <AddTaskDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        projectId=""
        projectStages={[]}
        onTaskAdded={fetchMeetingTasks}
        projectMembers={[]}
        isGeneral={true}
        meetingId={meetingId}
        isWorkspace={false}
      />
    </Card>
  );
};
