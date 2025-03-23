
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useMeetingTasks } from "@/hooks/meetings/useMeetingTasks";
import { TasksList } from "@/components/tasks/TasksList";
import { useState } from "react";
import { MeetingTasksDialogWithTemplates } from "./MeetingTasksDialogWithTemplates";

interface MeetingTasksSectionProps {
  meetingId: string;
}

export const MeetingTasksSection: React.FC<MeetingTasksSectionProps> = ({ meetingId }) => {
  const { data: tasks, isLoading, error, refetch } = useMeetingTasks(meetingId);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsAddTaskOpen(true);
  };

  return (
    <div className="space-y-4 text-right">
      <div className="flex justify-between items-center">
        <Button size="sm" onClick={handleOpenDialog} className="flex items-center">
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

      <MeetingTasksDialogWithTemplates
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        meetingId={meetingId}
        onSuccess={refetch}
      />
    </div>
  );
};
