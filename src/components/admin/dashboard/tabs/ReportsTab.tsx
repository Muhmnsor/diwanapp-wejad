
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { EventReportForm } from "@/components/events/reports/EventReportForm";
import { ReportsList } from "@/components/events/reports/components/ReportsList";
import { EventReportFormValues } from "@/components/events/reports/types";

interface ReportsTabProps {
  eventId: string;
}

export const ReportsTab = ({ eventId }: ReportsTabProps) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<(EventReportFormValues & { id: string }) | null>(null);

  const toggleForm = () => {
    setIsFormVisible(!isFormVisible);
    setSelectedReport(null); // Reset selected report when toggling form
  };

  const handleFormClose = () => {
    setIsFormVisible(false);
    setSelectedReport(null);
  };

  const handleEdit = (report: EventReportFormValues & { id: string }) => {
    setSelectedReport(report);
    setIsFormVisible(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">تقارير الفعالية</h2>
        <Button 
          onClick={toggleForm}
          className="flex items-center gap-2"
          variant={isFormVisible ? "outline" : "default"}
        >
          {isFormVisible ? (
            <>
              <X className="h-4 w-4" />
              إلغاء
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              إضافة تقرير جديد
            </>
          )}
        </Button>
      </div>

      <div className="space-y-6">
        {isFormVisible && (
          <div className="bg-white rounded-lg shadow-sm p-6 animate-in fade-in-0 slide-in-from-top duration-300">
            <EventReportForm 
              eventId={eventId} 
              onClose={handleFormClose}
              initialData={selectedReport}
              mode={selectedReport ? "edit" : "create"}
            />
          </div>
        )}

        <div className={`transition-all duration-300 ${isFormVisible ? 'animate-in fade-in-50' : ''}`}>
          <ReportsList eventId={eventId} onEdit={handleEdit} />
        </div>
      </div>
    </div>
  );
};
