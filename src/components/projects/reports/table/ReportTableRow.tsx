import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { EditReportDialog } from "@/components/events/reports/components/EditReportDialog";
import { ReportDeleteDialog } from "@/components/events/reports/components/dialog/ReportDeleteDialog";
import { ReportTableActions } from "./ReportTableActions";

interface ReportTableRowProps {
  report: any;
  onSuccess: () => Promise<void>;
}

export const ReportTableRow = ({ report, onSuccess }: ReportTableRowProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  return (
    <tr className="border-b">
      <td className="px-4 py-2">{report.report_name}</td>
      <td className="px-4 py-2">{report.executor?.email}</td>
      <td className="px-4 py-2">
        <ReportTableActions>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </ReportTableActions>
      </td>

      <EditReportDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        report={report}
        onSuccess={onSuccess}
      />

      <ReportDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        report={report}
        onSuccess={onSuccess}
      />
    </tr>
  );
};