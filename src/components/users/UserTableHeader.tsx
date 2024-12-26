import {
  TableHead,
  TableRow,
} from "@/components/ui/table";

export const UserTableHeader = () => {
  return (
    <TableRow>
      <TableHead className="w-[300px] text-right">معلومات المستخدم</TableHead>
      <TableHead className="text-right">آخر تسجيل دخول</TableHead>
      <TableHead className="w-[100px] text-center">الإجراءات</TableHead>
    </TableRow>
  );
};