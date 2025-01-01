import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProjectActivityReport } from "@/types/projectActivityReport";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface ProjectReportsListProps {
  projectId: string;
  activityId: string;
}

export const ProjectReportsList = ({
  projectId,
  activityId
}: ProjectReportsListProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);

  const { data: reports = [], refetch } = useQuery({
    queryKey: ['project-activity-reports', projectId, activityId],
    queryFn: async () => {
      console.log('Fetching reports for activity:', activityId);
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

      if (error) throw error;
      return data as ProjectActivityReport[];
    }
  });

  const handleDeleteClick = (reportId: string) => {
    setReportToDelete(reportId);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!reportToDelete) return;

    try {
      const { error } = await supabase
        .from('project_activity_reports')
        .delete()
        .eq('id', reportToDelete);

      if (error) throw error;

      toast.success('تم حذف التقرير بنجاح');
      refetch();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('حدث خطأ أثناء حذف التقرير');
    } finally {
      setIsDeleteDialogOpen(false);
      setReportToDelete(null);
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
                  onClick={() => handleDeleteClick(report.id)}
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
                {report.photos.map((photo, index) => {
                  const parsedPhoto = typeof photo === 'string' ? JSON.parse(photo) : photo;
                  return (
                    <img
                      key={index}
                      src={parsedPhoto.url}
                      alt={parsedPhoto.description || `صورة ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف التقرير</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من رغبتك في حذف هذا التقرير؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};