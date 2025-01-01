import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const ReportTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="text-right">اسم التقرير</TableHead>
        <TableHead className="text-right">معد التقرير</TableHead>
        <TableHead className="text-right">تاريخ الإضافة</TableHead>
        <TableHead className="text-center">إجراءات</TableHead>
      </TableRow>
    </TableHeader>
  );
};