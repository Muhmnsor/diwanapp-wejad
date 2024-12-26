import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';

interface EventReportsListProps {
  eventId: string;
}

export const EventReportsList = ({ eventId }: EventReportsListProps) => {
  const { data: reports } = useQuery({
    queryKey: ['event-reports', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_reports')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleDownload = (report: any) => {
    const workbook = XLSX.utils.book_new();
    
    // Create worksheet for report details
    const reportDetails = {
      "نص التقرير": report.report_text,
      "روابط الفيديو": report.video_links?.join(", ") || "",
      "روابط إضافية": report.additional_links?.join(", ") || "",
      "تاريخ التقرير": new Date(report.created_at).toLocaleDateString('ar'),
    };

    const ws = XLSX.utils.json_to_sheet([reportDetails], { header: Object.keys(reportDetails) });
    XLSX.utils.book_append_sheet(workbook, ws, "تقرير الفعالية");

    // Download the file
    XLSX.writeFile(workbook, `تقرير-الفعالية-${new Date(report.created_at).toLocaleDateString('ar')}.xlsx`);
  };

  if (!reports?.length) return null;

  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-lg font-semibold">التقارير السابقة</h3>
      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="text-sm text-gray-600">
                {new Date(report.created_at).toLocaleDateString('ar')}
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