
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardCheck } from "lucide-react";

interface MeetingDecisionsListProps {
  meetingId?: string;
}

export const MeetingDecisionsList = ({ meetingId }: MeetingDecisionsListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">القرارات</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          إضافة قرار
        </Button>
      </div>
      
      <EmptyState
        title="لا توجد قرارات"
        description="لم تتم إضافة أي قرارات لهذا الاجتماع بعد"
        icon={<ClipboardCheck className="h-8 w-8" />}
        action={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            إضافة قرار
          </Button>
        }
      />
    </div>
  );
};
