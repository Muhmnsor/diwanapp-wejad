
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, FileUp } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface MeetingAttachmentsListProps {
  meetingId: string | undefined;
}

export const MeetingAttachmentsList = ({ meetingId }: MeetingAttachmentsListProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Placeholder for actual data loading
  const isLoading = false;
  const error = null;
  const attachments = [];
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>جاري تحميل المرفقات...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-destructive text-center p-4">
        حدث خطأ أثناء تحميل المرفقات: {error}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">مرفقات الاجتماع</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          إضافة مرفق
        </Button>
      </div>
      
      <EmptyState
        title="لا توجد مرفقات"
        description="لم يتم إضافة أي مرفقات لهذا الاجتماع بعد."
        icon={<FileUp className="h-10 w-10 text-muted-foreground" />}
        action={
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            إضافة مرفق جديد
          </Button>
        }
      />
    </div>
  );
};
