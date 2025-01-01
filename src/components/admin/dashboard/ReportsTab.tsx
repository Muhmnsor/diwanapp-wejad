import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectActivityReportForm } from "@/components/projects/reports/ProjectActivityReportForm";
import { toast } from "sonner";

interface ReportsTabProps {
  eventId: string;
}

export const ReportsTab = ({ eventId }: ReportsTabProps) => {
  const queryClient = useQueryClient();

  const { data: reports = [] } = useQuery({
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

  const handleSuccess = async () => {
    console.log('Report submitted successfully, refreshing reports list');
    await queryClient.invalidateQueries({ queryKey: ['project-activity-reports', eventId] });
    toast.success("تم إضافة التقرير بنجاح");
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <ProjectActivityReportForm 
          projectId={eventId}
          activityId={eventId}
          onSuccess={handleSuccess}
        />
        
        {reports.length > 0 ? (
          <div className="space-y-6 mt-8">
            <h3 className="text-lg font-semibold">التقارير السابقة</h3>
            {reports.map((report) => (
              <div key={report.id} className="bg-secondary/20 p-6 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-semibold">{report.report_name}</h4>
                  <span className="text-sm text-gray-500">
                    {new Date(report.created_at).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{report.report_text}</p>
                {report.photos && report.photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {report.photos.map((photo: { url: string }, index: number) => (
                      <img
                        key={index}
                        src={photo.url}
                        alt={`صورة ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 mt-8">
            لا توجد تقارير سابقة
          </div>
        )}
      </CardContent>
    </Card>
  );
};