
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EventReportDialog } from "../reports/EventReportDialog";
import { EventReportsList } from "../reports/EventReportsList";

interface DashboardReportsTabProps {
  eventId: string;
}

export const DashboardReportsTab = ({ eventId }: DashboardReportsTabProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">تقارير الفعالية</h2>
        <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          إضافة تقرير
        </Button>
      </div>

      <EventReportsList eventId={eventId} />
      
      <EventReportDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        eventId={eventId}
      />
    </div>
  );
};
