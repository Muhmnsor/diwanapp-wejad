
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, List, Grid } from "lucide-react";
import { useMeetingTasks } from "@/hooks/meetings/useMeetingTasks";
import { TasksList } from "@/components/tasks/TasksList";
import { CustomEnhancedTaskDialog } from "./CustomEnhancedTaskDialog";

interface MeetingTasksSectionProps {
  meetingId: string;
}

export const MeetingTasksSection: React.FC<MeetingTasksSectionProps> = ({ meetingId }) => {
  const { data: tasks, isLoading, error, refetch } = useMeetingTasks(meetingId);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "card">("card");

  const handleOpenDialog = () => {
    setIsAddTaskOpen(true);
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === "table" ? "card" : "table");
  };

  return (
    <div className="space-y-4 text-right">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleOpenDialog} className="flex items-center">
            <Plus className="h-4 w-4 ml-2" />
            إضافة مهمة
          </Button>
          <Button size="sm" variant="outline" onClick={toggleViewMode} className="flex items-center">
            {viewMode === "table" ? (
              <>
                <Grid className="h-4 w-4 ml-2" />
                عرض البطاقات
              </>
            ) : (
              <>
                <List className="h-4 w-4 ml-2" />
                عرض الجدول
              </>
            )}
          </Button>
        </div>
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
            viewMode={viewMode}
          />
        </CardContent>
      </Card>

      <CustomEnhancedTaskDialog
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        meetingId={meetingId}
        onSuccess={refetch}
      />
    </div>
  );
};
