
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText } from "lucide-react";

interface MeetingMinutesListProps {
  meetingId?: string;
}

export const MeetingMinutesList = ({ meetingId }: MeetingMinutesListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">المحاضر</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          إضافة محضر
        </Button>
      </div>
      
      <EmptyState
        title="لا توجد محاضر"
        description="لم تتم إضافة أي محاضر لهذا الاجتماع بعد"
        icon={<FileText className="h-8 w-8" />}
        action={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            إضافة محضر
          </Button>
        }
      />
    </div>
  );
};
