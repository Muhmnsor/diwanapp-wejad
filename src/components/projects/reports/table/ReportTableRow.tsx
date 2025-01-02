import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { ProjectActivityReport } from "@/types/projectActivityReport";
import { EditReportDialog } from "../components/EditReportDialog";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface ReportTableRowProps {
  report: ProjectActivityReport;
  onDelete: (report: ProjectActivityReport) => void;
}

export const ReportTableRow = ({ report, onDelete }: ReportTableRowProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleEdit = () => {
    setShowEditDialog(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP", { locale: ar });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {report.report_name}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {report.program_name}
              </p>
              <p className="text-xs text-gray-400">
                {formatDate(report.created_at)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
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
            onClick={() => onDelete(report)}
            className="h-8 w-8 text-red-500 hover:text-red-600"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <EditReportDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        report={report}
      />
    </>
  );
};