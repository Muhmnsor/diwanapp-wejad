import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const ReportTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="text-right">اسم التقرير</TableHead>
        <TableHead className="text-right">اسم البرنامج</TableHead>
        <TableHead className="text-right">المنفذ</TableHead>
        <TableHead className="text-right">تاريخ الإنشاء</TableHead>
        <TableHead className="text-right">الإجراءات</TableHead>
      </TableRow>
    </TableHeader>
  );
};