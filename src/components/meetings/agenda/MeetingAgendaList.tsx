
import { useState } from "react";
import { AgendaItem } from "@/types/meeting";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, ClipboardList } from "lucide-react";
import { useMeetingAgenda } from "@/hooks/meetings/useMeetingAgenda";
import { EmptyState } from "@/components/ui/empty-state";

interface MeetingAgendaListProps {
  meetingId: string | undefined;
}

export const MeetingAgendaList = ({ meetingId }: MeetingAgendaListProps) => {
  const { data: agendaItems = [], isLoading, error } = useMeetingAgenda(meetingId);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>جاري تحميل جدول الأعمال...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-destructive text-center p-4">
        حدث خطأ أثناء تحميل جدول الأعمال: {error.message}
      </div>
    );
  }
  
  if (agendaItems.length === 0) {
    return (
      <EmptyState
        title="لا توجد بنود في جدول الأعمال"
        description="لم يتم إضافة أي بنود إلى جدول أعمال هذا الاجتماع بعد."
        icon={<ClipboardList className="h-10 w-10 text-muted-foreground" />}
        action={
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            إضافة بند جديد
          </Button>
        }
      />
    );
  }
  
  // Placeholder for displaying agenda items
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">جدول الأعمال</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          إضافة بند
        </Button>
      </div>
      
      <div className="bg-muted/20 p-8 rounded-md text-center">
        <p className="text-muted-foreground">
          سيتم إضافة عرض جدول الأعمال في التحديث القادم
        </p>
      </div>
    </div>
  );
};
