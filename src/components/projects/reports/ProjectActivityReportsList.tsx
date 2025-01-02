import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProjectActivityReport } from "@/types/projectActivityReport";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ProjectActivityReportsListProps {
  projectId: string;
  activityId: string;
}

export const ProjectActivityReportsList = ({
  projectId,
  activityId
}: ProjectActivityReportsListProps) => {
  const { data: reports = [], refetch } = useQuery({
    queryKey: ['project-activity-reports', projectId, activityId],
    queryFn: async () => {
      console.log('Fetching reports for activity:', activityId);
      try {
        const { data, error } = await supabase
          .from('project_activity_reports')
          .select(`
            *,
            profiles:executor_id (
              id,
              email
            )
          `)
          .eq('project_id', projectId)
          .eq('activity_id', activityId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching reports:', error);
          throw error;
        }

        // Transform the photos data to match the expected type
        return (data || []).map(report => ({
          ...report,
          photos: report.photos?.map(photo => {
            try {
              // If the photo is a string, try to parse it as JSON
              return typeof photo === 'string' ? JSON.parse(photo) : photo;
            } catch (e) {
              console.error('Error parsing photo:', e);
              return { url: photo, description: '' };
            }
          }) || []
        })) as ProjectActivityReport[];
      } catch (error) {
        console.error('Error in reports query:', error);
        toast.error('حدث خطأ أثناء تحميل التقارير');
        return [];
      }
    },
    retry: 1
  });

  const handleDelete = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('project_activity_reports')
        .delete()
        .eq('id', reportId);

      if (error) {
        console.error('Error deleting report:', error);
        toast.error('حدث خطأ أثناء حذف التقرير');
        return;
      }

      toast.success('تم حذف التقرير بنجاح');
      refetch();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('حدث خطأ أثناء حذف التقرير');
    }
  };

  if (!reports.length) {
    return (
      <div className="text-center text-gray-500 py-8">
        لا يوجد تقارير لهذا النشاط
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <Card key={report.id}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{report.report_name}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(report.created_at).toLocaleDateString('ar')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(report.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-gray-700">{report.report_text}</p>
            </div>
            {report.photos && report.photos.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {report.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo.url}
                    alt={photo.description || `صورة ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};