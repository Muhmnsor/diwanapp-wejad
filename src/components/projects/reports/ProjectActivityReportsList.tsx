import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectActivityReport } from "@/types/projectActivityReport";

interface ProjectActivityReportsListProps {
  projectId: string;
  activityId: string;
}

export const ProjectActivityReportsList = ({
  projectId,
  activityId,
}: ProjectActivityReportsListProps) => {
  const { data: reports, isLoading } = useQuery({
    queryKey: ['project-activity-reports', projectId, activityId],
    queryFn: async () => {
      console.log("Fetching reports for activity:", activityId);
      const { data, error } = await supabase
        .from('project_activity_reports')
        .select(`
          *,
          profiles:executor_id (
            email
          )
        `)
        .eq('project_id', projectId)
        .eq('activity_id', activityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log("Fetched reports:", data);
      return data as ProjectActivityReport[];
    },
    enabled: !!projectId && !!activityId,
  });

  if (isLoading) {
    return <div className="text-center py-4">جاري تحميل التقارير...</div>;
  }

  if (!reports?.length) {
    return <div className="text-center py-4">لا توجد تقارير لهذا النشاط</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">التقارير السابقة</h3>
      {reports.map((report) => (
        <Card key={report.id}>
          <CardHeader>
            <CardTitle className="text-lg">{report.report_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-gray-600">{report.report_text}</p>
              <div className="text-sm text-gray-500">
                <p>تاريخ التقرير: {new Date(report.created_at).toLocaleDateString('ar-SA')}</p>
                <p>بواسطة: {report.profiles?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};