
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { downloadEventReport } from "@/utils/reports/downloadEventReport";

interface EventReportDownloadButtonProps {
  report: any;
}

export const EventReportDownloadButton = ({ report }: EventReportDownloadButtonProps) => {
  const handleDownload = async () => {
    try {
      await downloadEventReport(report);
      toast.success('جاري تحميل التقرير');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('حدث خطأ أثناء تحميل التقرير');
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleDownload}
      title="تنزيل التقرير"
    >
      <Download className="h-4 w-4" />
    </Button>
  );
};
