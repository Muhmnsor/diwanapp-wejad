import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ReportListHeaderProps {
  title: string;
}

export const ReportListHeader = ({ title }: ReportListHeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="text-right">اسم التقرير</TableHead>
        <TableHead className="text-right">معد التقرير</TableHead>
        <TableHead className="text-right">تاريخ الإعداد</TableHead>
        <TableHead className="text-center">الإجراءات</TableHead>
      </TableRow>
    </TableHeader>
  );
};