import { useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Edit, Trash } from "lucide-react";
import { EditReportDialog } from "@/components/events/reports/components/dialog/EditReportDialog";
import { ReportDeleteDialog } from "@/components/events/reports/components/dialog/ReportDeleteDialog";
import { Report } from "@/types/report";

interface ReportTableRowProps {
  report: Report;
  onSuccess?: () => Promise<void>;
}

export const ReportTableRow = ({ report, onSuccess }: ReportTableRowProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleEditSuccess = async () => {
    setIsEditOpen(false);
    if (onSuccess) await onSuccess();
  };

  const handleDeleteSuccess = async () => {
    setIsDeleteOpen(false);
    if (onSuccess) await onSuccess();
  };

  return (
    <tr key={report.id}>
      <td className="px-4 py-2">{report.report_name}</td>
      <td className="px-4 py-2">{report.program_name}</td>
      <td className="px-4 py-2">
        {format(new Date(report.created_at), 'PPP', { locale: ar })}
      </td>
      <td className="px-4 py-2">
        <div className="flex gap-2 justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditOpen(true)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </td>

      <EditReportDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        report={report}
        onSuccess={handleEditSuccess}
      />

      <ReportDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        reportId={report.id}
        onSuccess={handleDeleteSuccess}
      />
    </tr>
  );
};