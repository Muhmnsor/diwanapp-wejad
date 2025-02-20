
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EventReportFormValues } from "../types";
import { ReportDeleteDialog } from "@/components/reports/shared/components/ReportDeleteDialog";
import { toast } from "sonner";
import { EventReportDownloadButton } from "./EventReportDownloadButton";

interface ReportsListProps {
  eventId: string;
  onEdit: (report: EventReportFormValues & { id: string }) => void;
}

export const ReportsList = ({ eventId, onEdit }: ReportsListProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["event-reports", eventId],
    queryFn: async () => {
      console.log("Fetching reports for event:", eventId);

      const { data, error } = await supabase
        .from("event_reports")
        .select(`
          *,
          profiles:executor_id (
            email
          ),
          events:event_id (
            event_hours
          )
        `)
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reports:", error);
        throw error;
      }

      console.log("Fetched reports:", data);
      return data || [];
    }
  });

  const handleEdit = (report: any) => {
    const photos = report.photos?.map((url: string, index: number) => ({
      url,
      description: report.photo_descriptions?.[index] || ""
    })) || [];

    while (photos.length < 6) {
      photos.push({ url: "", description: "" });
    }

    const formData: EventReportFormValues & { id: string } = {
      id: report.id,
      report_name: report.report_name,
      report_text: report.report_text,
      objectives: report.objectives || "",
      impact_on_participants: report.impact_on_participants || "",
      speaker_name: report.speaker_name || "",
      attendees_count: report.attendees_count || 0,
      absent_count: report.absent_count || 0,
      satisfaction_level: report.satisfaction_level || 0,
      partners: report.partners || "",
      links: report.links?.join('\n') || "",
      photos
    };
    onEdit(formData);
  };

  const handleDelete = async () => {
    if (!reportToDelete) return;

    try {
      const { error } = await supabase
        .from('event_reports')
        .delete()
        .eq('id', reportToDelete);

      if (error) throw error;

      toast.success('تم حذف التقرير بنجاح');
      queryClient.invalidateQueries({ queryKey: ["event-reports", eventId] });
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('حدث خطأ أثناء حذف التقرير');
    } finally {
      setIsDeleteDialogOpen(false);
      setReportToDelete(null);
    }
  };

  const openDeleteDialog = (reportId: string) => {
    setReportToDelete(reportId);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="overflow-hidden border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-center py-4 text-gray-700 font-semibold">معد التقرير</TableHead>
              <TableHead className="text-center py-4 text-gray-700 font-semibold">اسم التقرير</TableHead>
              <TableHead className="text-center py-4 text-gray-700 font-semibold">مدة الفعالية</TableHead>
              <TableHead className="text-center py-4 text-gray-700 font-semibold">تاريخ الإنشاء</TableHead>
              <TableHead className="text-center py-4 text-gray-700 font-semibold">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="text-gray-500">لا توجد تقارير بعد</div>
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow 
                  key={report.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="text-center py-4 text-gray-700">
                    {report.profiles?.email || "غير معروف"}
                  </TableCell>
                  <TableCell className="text-center py-4">
                    <div>
                      <div className="font-medium text-gray-900">{report.report_name}</div>
                      {report.report_text && (
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {report.report_text}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-4 text-gray-700">
                    {report.events?.event_hours || 0} ساعات
                  </TableCell>
                  <TableCell className="text-center py-4 text-gray-700">
                    {format(new Date(report.created_at), "yyyy-MM-dd")}
                  </TableCell>
                  <TableCell className="text-center py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleEdit(report)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => openDeleteDialog(report.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <EventReportDownloadButton report={report} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ReportDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </div>
  );
};
