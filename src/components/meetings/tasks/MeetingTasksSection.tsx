
import { useState } from "react";
import { TasksList } from "@/components/meetings/content";
import { useMeetingTasks } from "@/hooks/meetings/useMeetingTasks";
import { EnhancedAddTaskDialog } from "./EnhancedAddTaskDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface MeetingTasksSectionProps {
  meetingId: string;
}

export const MeetingTasksSection = ({ meetingId }: MeetingTasksSectionProps) => {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const { data: tasks, isLoading, error, refetch } = useMeetingTasks(meetingId);

  const handleTaskAdded = () => {
    console.log("Task added successfully, refreshing task list");
    refetch();
  };

  console.log("MeetingTasksSection rendering with meetingId:", meetingId);
  console.log("Add Task Dialog state:", isAddTaskOpen);

  const handleAddTaskClick = () => {
    console.log("Add Task button clicked in MeetingTasksSection");
    setIsAddTaskOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">المهام</h3>
        <Button onClick={handleAddTaskClick} className="rtl">
          <Plus className="h-4 w-4 ml-2" />
          إضافة مهمة جديدة
        </Button>
      </div>

      {/* Display tasks list */}
      {isLoading ? (
        <div className="py-4 text-center">جاري تحميل المهام...</div>
      ) : error ? (
        <div className="py-4 text-center text-red-500">حدث خطأ أثناء تحميل المهام</div>
      ) : tasks && tasks.length > 0 ? (
        <TasksList 
          meetingId={meetingId}
          hideAddButton={true} // Pass prop to hide the add button in TasksList
        />
      ) : (
        <div className="py-6 text-center text-muted-foreground border rounded-md">
          لا توجد مهام لهذا الاجتماع. انقر على "إضافة مهمة جديدة" لإضافة المهام.
        </div>
      )}

      {/* The enhanced dialog component */}
      <EnhancedAddTaskDialog 
        meetingId={meetingId}
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        onSuccess={handleTaskAdded}
      />
    </div>
  );
};
