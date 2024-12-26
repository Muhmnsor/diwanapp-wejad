import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';
import { Skeleton } from "@/components/ui/skeleton";

interface EventReportsListProps {
  eventId: string;
}

export const EventReportsList = ({ eventId }: EventReportsListProps) => {
  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['event-reports', eventId],
    queryFn: async () => {
      console.log('Fetching reports for event:', eventId);
      const { data, error } = await supabase
        .from('event_reports')
        .select(`
          *,
          executor:executor_id (
            id,
            email
          )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
        throw error;
      }

      console.log('Reports fetched:', data);
      return data;
    },
  });

  const handleDownload = (report: any) => {
    // Create workbook with multiple sheets
    const workbook = XLSX.utils.book_new();
    
    // Sheet 1: Report Details
    const reportDetails = {
      "تاريخ التقرير": new Date(report.created_at).toLocaleDateString('ar'),
      "منفذ التقرير": report.executor?.email || 'غير محدد',
      "نص التقرير": report.report_text,
      "مستوى الرضا": report.satisfaction_level ? `${report.satisfaction_level}/5` : 'غير محدد',
    };
    const detailsSheet = XLSX.utils.json_to_sheet([reportDetails], { header: Object.keys(reportDetails) });
    XLSX.utils.book_append_sheet(workbook, detailsSheet, "تفاصيل التقرير");

    // Sheet 2: Media Links
    const mediaLinks = {
      "روابط الفيديو": report.video_links?.join("\n") || "لا يوجد",
      "روابط إضافية": report.additional_links?.join("\n") || "لا يوجد",
      "روابط الصور": report.photos?.join("\n") || "لا يوجد",
      "الملفات المرفقة": report.files?.join("\n") || "لا يوجد"
    };
    const mediaSheet = XLSX.utils.json_to_sheet([mediaLinks], { header: Object.keys(mediaLinks) });
    XLSX.utils.book_append_sheet(workbook, mediaSheet, "الوسائط والروابط");

    // Download the file
    XLSX.writeFile(workbook, `تقرير-الفعالية-${new Date(report.created_at).toLocaleDateString('ar')}.xlsx`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 mt-6">
        <h3 className="text-lg font-semibold">التقارير السابقة</h3>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Error in EventReportsList:', error);
    return (
      <div className="text-red-500 p-4 text-center">
        حدث خطأ أثناء تحميل التقارير
      </div>
    );
  }

  if (!reports?.length) {
    return (
      <div className="text-gray-500 p-4 text-center">
        لا توجد تقارير سابقة
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-lg font-semibold">التقارير السابقة</h3>
      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                {new Date(report.created_at).toLocaleDateString('ar')}
              </p>
              <p className="text-xs text-gray-500">
                {report.executor?.email || 'غير محدد'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(report)}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              تحميل التقرير
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};