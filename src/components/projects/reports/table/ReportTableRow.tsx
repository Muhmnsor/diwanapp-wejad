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
      <TableCell className="text-right w-1/3 font-medium">
        {report.report_name}
      </TableCell>
      <TableCell className="text-right w-1/3">
        {report.profiles?.email || 'غير معروف'}
      </TableCell>
      <TableCell className="text-right w-1/3">
        {new Date(report.created_at).toLocaleDateString('ar')}
      </TableCell>
      <TableCell className="text-center w-[100px]">
        <ReportTableActions onDelete={() => onDelete(report.id)} />
      </TableCell>
    </TableRow>
  );
};