import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ReportListHeaderProps {
  title: string;
}

export const ReportListHeader = ({ title }: ReportListHeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="text-right pr-6">اسم التقرير</TableHead>
        <TableHead className="text-right pr-6">معد التقرير</TableHead>
        <TableHead className="text-right pr-6">تاريخ الإعداد</TableHead>
        <TableHead className="text-center">الإجراءات</TableHead>
      </TableRow>
    </TableHeader>
  );
};