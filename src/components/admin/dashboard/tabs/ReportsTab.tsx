
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EventReportDialog } from "@/components/events/reports/EventReportDialog";

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

      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          لا توجد تقارير حالياً
        </div>
      </Card>

      <EventReportDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        eventId={eventId}
      />
    </div>
  );
};
