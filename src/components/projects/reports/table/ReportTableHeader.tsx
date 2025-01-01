import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const ReportTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="text-right w-1/3">اسم التقرير</TableHead>
        <TableHead className="text-right w-1/3">معد التقرير</TableHead>
        <TableHead className="text-right w-1/3">تاريخ الإضافة</TableHead>
        <TableHead className="text-center w-[100px]">إجراءات</TableHead>
      </TableRow>
    </TableHeader>
  );
};