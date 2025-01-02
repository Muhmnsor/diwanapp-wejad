import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Download } from "lucide-react";
import { ProjectActivityReport } from "@/types/projectActivityReport";
import { EditReportDialog } from "../components/EditReportDialog";
import { downloadReportWithImages } from "../utils/downloadUtils";
import { toast } from "sonner";

interface ReportTableRowProps {
  report: ProjectActivityReport;
  onDelete: (report: ProjectActivityReport) => void;
}

export const ReportTableRow = ({ report, onDelete }: ReportTableRowProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleEdit = () => {
    setShowEditDialog(true);
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      console.log('Starting download for report:', report.id);
      const success = await downloadReportWithImages(report, report.events?.title);
      
      if (success) {
        toast.success('تم تحميل التقرير بنجاح');
      } else {
        toast.error('حدث خطأ أثناء تحميل التقرير');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('حدث خطأ أثناء تحميل التقرير');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <TableRow>
        <TableCell className="text-right">{report.report_name}</TableCell>
        <TableCell className="text-right">{report.program_name}</TableCell>
        <TableCell className="text-right">
          {report.profiles?.email || "غير معروف"}
        </TableCell>
        <TableCell className="text-right">
          {new Date(report.created_at).toLocaleDateString("ar-SA")}
        </TableCell>
        <TableCell>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEdit}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              disabled={isDownloading}
              className="h-8 w-8 text-blue-500 hover:text-blue-600"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(report)}
              className="h-8 w-8 text-red-500 hover:text-red-600"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {showEditDialog && (
        <EditReportDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          report={report}
        />
      )}
    </>
  );
};