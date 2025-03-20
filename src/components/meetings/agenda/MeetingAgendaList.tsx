
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ListChecks } from "lucide-react";

interface MeetingAgendaListProps {
  meetingId?: string;
}

export const MeetingAgendaList = ({ meetingId }: MeetingAgendaListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">جدول الأعمال</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          إضافة بند
        </Button>
      </div>
      
      <EmptyState
        title="لا توجد بنود"
        description="لم تتم إضافة أي بنود لجدول أعمال هذا الاجتماع بعد"
        icon={<ListChecks className="h-8 w-8" />}
        action={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            إضافة بند
          </Button>
        }
      />
    </div>
  );
};
