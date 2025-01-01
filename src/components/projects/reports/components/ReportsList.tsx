import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProjectActivityReport } from "@/types/projectActivityReport";

interface ReportsListProps {
  projectId: string;
  activityId: string;
}

export const ReportsList = ({ projectId, activityId }: ReportsListProps) => {
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['project-activity-reports', projectId, activityId],
    queryFn: async () => {
      console.log("Fetching reports for activity:", activityId);
      const { data, error } = await supabase
        .from('project_activity_reports')
        .select('*')
        .eq('project_id', projectId)
        .eq('activity_id', activityId);

      if (error) throw error;
      return data as ProjectActivityReport[];
    },
  });

  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }

  if (!reports.length) {
    return <div>لا توجد تقارير لهذا النشاط</div>;
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div key={report.id} className="p-4 border rounded-lg">
          <h3 className="font-bold">{report.report_name}</h3>
          <p className="text-gray-600">{report.report_text}</p>
          {report.photos && report.photos.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              {report.photos.map((photo: { url: string; description: string }, index: number) => (
                <div key={index}>
                  <img src={photo.url} alt={photo.description} className="rounded-lg" />
                  <p className="mt-2 text-sm text-gray-500">{photo.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};