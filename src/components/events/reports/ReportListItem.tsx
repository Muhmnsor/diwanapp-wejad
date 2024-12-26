import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';

interface ReportListItemProps {
  report: any;
  onDownload: (report: any) => void;
}

export const ReportListItem = ({ report, onDownload }: ReportListItemProps) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
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
        onClick={() => onDownload(report)}
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        تحميل التقرير
      </Button>
    </div>
  );
};