import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, FileCheck } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface MeetingDecisionsListProps {
  meetingId: string | undefined;
}

export const MeetingDecisionsList = ({ meetingId }: MeetingDecisionsListProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Placeholder for actual data loading
  const isLoading = false;
  const error = null;
  const decisions = [];
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>جاري تحميل القرارات...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-destructive text-center p-4">
        حدث خطأ أثناء تحميل القرارات: {error}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">قرارات الاجتماع</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          إضافة قرار
        </Button>
      </div>
      
      <EmptyState
        title="لا توجد قرارات"
        description="لم يتم تسجيل أي قرارات لهذا الاجتماع بعد."
        icon={<FileCheck className="h-10 w-10 text-muted-foreground" />}
        action={
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            إضافة قرار جديد
          </Button>
        }
      />
    </div>
  );
};
