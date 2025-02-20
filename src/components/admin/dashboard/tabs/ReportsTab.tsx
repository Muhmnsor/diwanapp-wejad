
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EventReportDialog } from "@/components/events/reports/EventReportDialog";
import { ReportsList } from "@/components/events/reports/components/ReportsList";

interface ReportsTabProps {
  eventId: string;
}

export const ReportsTab = ({ eventId }: ReportsTabProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">تقارير الفعالية</h2>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          إضافة تقرير جديد
        </Button>
      </div>

      <ReportsList eventId={eventId} />

      <EventReportDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        eventId={eventId}
      />
    </div>
  );
};
