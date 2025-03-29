
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Edit, Trash } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useEventReports } from "@/hooks/reports/useEventReports";
import { EventReportDialog } from "./EventReportDialog";
import { ReportDeleteDialog } from "@/components/reports/shared/components/ReportDeleteDialog";
import { Skeleton } from "@/components/ui/skeleton";

interface EventReportsListProps {
  eventId: string;
}

export const EventReportsList = ({ eventId }: EventReportsListProps) => {
  const [isAddReportOpen, setIsAddReportOpen] = useState(false);
  
  const {
    reports,
    isLoading,
    selectedReport,
    setSelectedReport,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isEditing,
    setIsEditing,
    isDeleting,
    handleDelete,
    handleDownload,
    handleEdit,
    refetch
  } = useEventReports(eventId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">تقارير الفعالية</h3>
        <Button onClick={() => setIsAddReportOpen(true)}>إضافة تقرير جديد</Button>
      </div>

      {reports.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          لا توجد تقارير لهذه الفعالية
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-lg">{report.report_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    بواسطة: {report.profiles?.display_name || report.profiles?.email || 'غير معروف'} | 
                    {format(new Date(report.created_at), ' dd MMM yyyy', { locale: ar })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(report)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDownload(report)}
                    className="h-8 w-8 p-0"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setSelectedReport(report);
                      setIsDeleteDialogOpen(true);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm line-clamp-2">{report.report_text}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <EventReportDialog
        isOpen={isAddReportOpen}
        onClose={() => setIsAddReportOpen(false)}
        eventId={eventId}
      />

      {isEditing && selectedReport && (
        <EventReportDialog
          isOpen={isEditing}
          onClose={() => {
            setIsEditing(false);
            setSelectedReport(null);
          }}
          eventId={eventId}
          initialData={selectedReport}
          mode="edit"
        />
      )}

      <ReportDeleteDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </div>
  );
};
