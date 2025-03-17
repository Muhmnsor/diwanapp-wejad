
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, CheckSquare } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { useMeetingTasks } from "@/hooks/meetings/useMeetingTasks";

interface MeetingTasksListProps {
  meetingId: string | undefined;
}

export const MeetingTasksList = ({ meetingId }: MeetingTasksListProps) => {
  const { data: tasks = [], isLoading, error } = useMeetingTasks(meetingId);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>جاري تحميل المهام...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-destructive text-center p-4">
        حدث خطأ أثناء تحميل المهام: {error.message}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">مهام الاجتماع</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          إضافة مهمة
        </Button>
      </div>
      
      {tasks.length === 0 ? (
        <EmptyState
          title="لا توجد مهام"
          description="لم يتم إضافة أي مهام لهذا الاجتماع بعد."
          icon={<CheckSquare className="h-10 w-10 text-muted-foreground" />}
          action={
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              إضافة مهمة جديدة
            </Button>
          }
        />
      ) : (
        <div className="bg-muted/20 p-8 rounded-md text-center">
          <p className="text-muted-foreground">
            سيتم إضافة عرض المهام في التحديث القادم
          </p>
        </div>
      )}
    </div>
  );
};
