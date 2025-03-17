
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, FileText } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface MeetingMinutesListProps {
  meetingId: string | undefined;
}

export const MeetingMinutesList = ({ meetingId }: MeetingMinutesListProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Placeholder for actual data loading
  const isLoading = false;
  const error = null;
  const minutes = [];
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>جاري تحميل المحاضر...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-destructive text-center p-4">
        حدث خطأ أثناء تحميل المحاضر: {error}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">محاضر الاجتماع</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          إنشاء محضر جديد
        </Button>
      </div>
      
      <EmptyState
        title="لا توجد محاضر"
        description="لم يتم إنشاء أي محاضر لهذا الاجتماع بعد."
        icon={<FileText className="h-10 w-10 text-muted-foreground" />}
        action={
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            إنشاء محضر جديد
          </Button>
        }
      />
    </div>
  );
};
