
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { File } from "lucide-react";

interface MeetingAttachmentsListProps {
  meetingId?: string;
}

export const MeetingAttachmentsList = ({ meetingId }: MeetingAttachmentsListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">المرفقات</h2>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          رفع ملف
        </Button>
      </div>
      
      <EmptyState
        title="لا توجد مرفقات"
        description="لم تتم إضافة أي مرفقات لهذا الاجتماع بعد"
        icon={<File className="h-8 w-8" />}
        action={
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            رفع ملف
          </Button>
        }
      />
    </div>
  );
};
