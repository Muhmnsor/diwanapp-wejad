import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ReportListHeaderProps {
  title: string;
}

export const ReportListHeader = ({ title }: ReportListHeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="text-right pr-8 font-bold">اسم التقرير</TableHead>
        <TableHead className="text-right pr-8 font-bold">معد التقرير</TableHead>
        <TableHead className="text-right pr-8 font-bold">تاريخ الإعداد</TableHead>
        <TableHead className="text-center font-bold">الإجراءات</TableHead>
      </TableRow>
    </TableHeader>
  );
};