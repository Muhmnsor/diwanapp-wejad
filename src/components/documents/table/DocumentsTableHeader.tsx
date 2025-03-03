
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const DocumentsTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="text-center">م</TableHead>
        <TableHead className="text-center">اسم المستند</TableHead>
        <TableHead className="text-center">النوع</TableHead>
        <TableHead className="text-center">تاريخ الانتهاء</TableHead>
        <TableHead className="text-center">الأيام المتبقية</TableHead>
        <TableHead className="text-center">الحالة</TableHead>
        <TableHead className="text-center">جهة الإصدار</TableHead>
        <TableHead className="text-center">الإجراءات</TableHead>
      </TableRow>
    </TableHeader>
  );
};
