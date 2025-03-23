
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useMeetingTasks } from "@/hooks/meetings/useMeetingTasks";
import { TasksList } from "@/components/tasks/TasksList";
import { useState } from "react";
import { CustomAddTaskDialog } from "@/components/meetings/tasks/CustomAddTaskDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MeetingTasksSectionProps {
  meetingId: string;
}

export const MeetingTasksSection: React.FC<MeetingTasksSectionProps> = ({ meetingId }) => {
  const { data: tasks, isLoading, error, refetch } = useMeetingTasks(meetingId);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  
  // Fetch meeting participants to use as potential assignees
  const { data: participants } = useQuery({
    queryKey: ['meeting-participants', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_participants')
        .select('user_id, user_display_name, user_email')
        .eq('meeting_id', meetingId);
        
      if (error) throw error;
      return data;
    },
    enabled: !!meetingId,
  });

  // Fetch all active users from profiles
  const { data: users } = useQuery({
    queryKey: ["users-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, display_name")
        .eq("is_active", true)
        .order("display_name", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-4 text-right">
      <div className="flex justify-between items-center">
        <Button size="sm" onClick={() => setIsAddTaskOpen(true)} className="flex items-center">
          <Plus className="h-4 w-4 ml-2" />
          إضافة مهمة
        </Button>
        <h3 className="text-lg font-semibold">مهام الاجتماع</h3>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>قائمة المهام</CardTitle>
        </CardHeader>
        <CardContent>
          <TasksList 
            tasks={tasks} 
            isLoading={isLoading} 
            error={error} 
            onTasksChange={refetch}
          />
        </CardContent>
      </Card>

      <CustomAddTaskDialog
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        meetingId={meetingId}
        onSuccess={refetch}
        users={users || []}
        participants={participants || []}
      />
    </div>
  );
};
