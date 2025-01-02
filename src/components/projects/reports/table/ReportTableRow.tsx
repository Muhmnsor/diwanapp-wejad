import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Download } from "lucide-react";
import { ProjectActivityReport } from "@/types/projectActivityReport";
import { EditReportDialog } from "../components/EditReportDialog";

interface ReportTableRowProps {
  report: ProjectActivityReport;
  onDelete: (report: ProjectActivityReport) => void;
}

export const ReportTableRow = ({ report, onDelete }: ReportTableRowProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleEdit = () => {
    setShowEditDialog(true);
  };

  const handleDownload = () => {
    // Handle download functionality here
    console.log('Downloading report:', report.id);
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