import { TableCell, TableRow } from "@/components/ui/table";
import { ProjectActivityReport } from "@/types/projectActivityReport";
import { ReportTableActions } from "./ReportTableActions";

interface ReportTableRowProps {
  report: ProjectActivityReport;
  onDelete: (reportId: string) => void;
}

export const ReportTableRow = ({ report, onDelete }: ReportTableRowProps) => {
  return (
    <TableRow>
      <TableCell className="text-right font-medium">
        {report.report_name}
      </TableCell>
      <TableCell className="text-right">
        {report.profiles?.email || 'غير معروف'}
      </TableCell>
      <TableCell className="text-right">
        {new Date(report.created_at).toLocaleDateString('ar')}
      </TableCell>
      <TableCell className="text-center">
        <ReportTableActions onDelete={() => onDelete(report.id)} />
      </TableCell>
    </TableRow>
  );
};