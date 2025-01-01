import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProjectActivityReportDialog } from "@/components/projects/reports/ProjectActivityReportDialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ReportsTabProps {
  eventId: string;
}

export const ReportsTab = ({ eventId }: ReportsTabProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: reports = [], refetch: refetchReports } = useQuery({
    queryKey: ['project-activity-reports', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_activity_reports')
        .select(`
          *,
          profiles (
            id,
            email
          )
        `)
        .eq('activity_id', eventId);

      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="pt-6 space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة تقرير
        </Button>
      </div>

      {reports.length > 0 ? (
        <div className="space-y-6">
          {reports.map((report) => (
            <div key={report.id} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">{report.report_name}</h3>
              <p className="text-gray-600">{report.report_text}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          لا توجد تقارير بعد
        </div>
      )}

      <ProjectActivityReportDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        projectId={eventId}
        activityId={eventId}
      />
    </div>
  );
};