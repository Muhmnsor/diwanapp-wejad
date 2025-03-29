
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { downloadEventReport } from "@/utils/reports/downloadEventReport";

export const useEventReports = (eventId: string) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: reports = [], isLoading, refetch } = useQuery({
    queryKey: ['event-reports', eventId],
    queryFn: async () => {
      console.log("Fetching reports for event:", eventId);
      const { data: reportsData, error: reportsError } = await supabase
        .from('event_reports')
        .select(`
          *,
          profiles:executor_id (
            display_name,
            email
          )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (reportsError) {
        console.error("Error fetching reports:", reportsError);
        throw reportsError;
      }

      console.log("Fetched event reports:", reportsData);
      return reportsData || [];
    },
  });

  const handleDelete = async () => {
    if (!selectedReport) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('event_reports')
        .delete()
        .eq('id', selectedReport.id);

      if (error) throw error;

      toast.success("تم حذف التقرير بنجاح");
      refetch();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error("حدث خطأ أثناء حذف التقرير");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedReport(null);
    }
  };

  const handleDownload = async (report: any) => {
    try {
      await downloadEventReport(report);
      toast.success("تم تحميل التقرير بنجاح");
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error("حدث خطأ أثناء تحميل التقرير");
    }
  };

  const handleEdit = (report: any) => {
    setSelectedReport(report);
    setIsEditing(true);
  };

  return {
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
  };
};
