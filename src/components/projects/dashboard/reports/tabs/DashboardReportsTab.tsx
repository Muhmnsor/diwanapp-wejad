
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReportForm } from "@/components/projects/dashboard/reports/ReportForm";
import { ReportDeleteDialog } from "@/components/reports/shared/components/ReportDeleteDialog";
import { downloadReport } from "@/components/reports/project-reports/handlers/projectReportHandlers";
import { useToast } from "@/hooks/use-toast";
import { ReportsHeader } from "@/components/projects/dashboard/reports/components/ReportsHeader";
import { ReportsTable } from "@/components/projects/dashboard/reports/components/ReportsTable";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface DashboardReportsTabProps {
  projectId: string;
}

export const DashboardReportsTab = ({ projectId }: DashboardReportsTabProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const { data: reports = [], isLoading, refetch } = useQuery({
    queryKey: ['project-reports', projectId],
    queryFn: async () => {
      console.log("Fetching reports for project:", projectId);
      const { data: reportsData, error: reportsError } = await supabase
        .from('project_activity_reports')
        .select(`
          *,
          events:activity_id (
            id,
            title,
            event_hours,
            is_project_activity,
            description
          ),
          profiles:author_id (
            email
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (reportsError) {
        console.error("Error fetching reports:", reportsError);
        throw reportsError;
      }

      const reportsWithFeedback = await Promise.all(
        reportsData.map(async (report) => {
          if (report.activity_id) {
            const { data: feedbackData, error: feedbackError } = await supabase
              .from('event_feedback')
              .select('*')
              .eq('event_id', report.activity_id);

            if (feedbackError) {
              console.error("Error fetching feedback:", feedbackError);
              return report;
            }

            const validFeedback = feedbackData.filter(f => 
              f.overall_rating !== null || 
              f.content_rating !== null || 
              f.organization_rating !== null || 
              f.presenter_rating !== null
            );

            const averageRatings = validFeedback.length > 0 ? {
              overall_rating: validFeedback.reduce((sum, f) => sum + (f.overall_rating || 0), 0) / validFeedback.filter(f => f.overall_rating !== null).length,
              content_rating: validFeedback.reduce((sum, f) => sum + (f.content_rating || 0), 0) / validFeedback.filter(f => f.content_rating !== null).length,
              organization_rating: validFeedback.reduce((sum, f) => sum + (f.organization_rating || 0), 0) / validFeedback.filter(f => f.organization_rating !== null).length,
              presenter_rating: validFeedback.reduce((sum, f) => sum + (f.presenter_rating || 0), 0) / validFeedback.filter(f => f.presenter_rating !== null).length,
              count: validFeedback.length
            } : null;

            return {
              ...report,
              activity: {
                ...report.events,
                activity_feedback: feedbackData,
                averageRatings
              }
            };
          }
          return report;
        })
      );

      console.log("Fetched reports with feedback:", reportsWithFeedback);
      return reportsWithFeedback || [];
    },
  });

  const handleDelete = async () => {
    if (!selectedReport) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('project_activity_reports')
        .delete()
        .eq('id', selectedReport.id);

      if (error) throw error;

      toast({
        title: "تم حذف التقرير بنجاح",
        variant: "default",
      });
      
      refetch();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "حدث خطأ أثناء حذف التقرير",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedReport(null);
    }
  };

  const handleDownload = async (report: any) => {
    try {
      await downloadReport(report);
      toast({
        title: "تم تحميل التقرير بنجاح",
        variant: "default",
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "حدث خطأ أثناء تحميل التقرير",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (report: any) => {
    setSelectedReport(report);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <ReportsHeader onAddReport={() => setIsFormOpen(!isFormOpen)} />

      {isFormOpen && (
        <ReportForm 
          projectId={projectId} 
          report={selectedReport}
          onSuccess={() => {
            setIsFormOpen(false);
            setSelectedReport(null);
            refetch();
          }}
        />
      )}

      <ReportsTable 
        reports={reports}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={(report) => {
          setSelectedReport(report);
          setIsDeleteDialogOpen(true);
        }}
        onDownload={handleDownload}
        isDeleting={isDeleting}
        selectedReport={selectedReport}
        formatDate={(date) => format(new Date(date), 'dd/MM/yyyy', { locale: ar })}
      />

      <ReportDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </div>
  );
};
