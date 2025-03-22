
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useMeetingTasks } from "@/hooks/meetings/useMeetingTasks";
import { TasksList } from "@/components/tasks/TasksList";
import { useState } from "react";
import { AddTaskDialog } from "@/components/meetings/tasks/AddTaskDialog";

interface MeetingTasksSectionProps {
  meetingId: string;
}

export const MeetingTasksSection: React.FC<MeetingTasksSectionProps> = ({ meetingId }) => {
  const { data: tasks, isLoading, error, refetch } = useMeetingTasks(meetingId);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">مهام الاجتماع</h3>
        <Button size="sm" onClick={() => setIsAddTaskOpen(true)}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة مهمة
        </Button>
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
          />
        </CardContent>
      </Card>

      <AddTaskDialog
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        meetingId={meetingId}
        onSuccess={refetch}
      />
    </div>
  );
};
