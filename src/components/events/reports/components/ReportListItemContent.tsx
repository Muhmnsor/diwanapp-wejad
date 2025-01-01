import { TableCell } from "@/components/ui/table";

interface ReportListItemContentProps {
  reportName: string;
  authorEmail: string;
  createdAt: string;
}

export const ReportListItemContent = ({
  reportName,
  authorEmail,
  createdAt,
}: ReportListItemContentProps) => {
  return (
    <>
      <TableCell className="text-right w-1/3">{reportName}</TableCell>
      <TableCell className="text-right w-1/3">{authorEmail}</TableCell>
      <TableCell className="text-right w-1/3">
        {new Date(createdAt).toLocaleDateString('ar')}
      </TableCell>
    </>
  );
};