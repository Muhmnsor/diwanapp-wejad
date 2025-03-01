
import {
  TableHead,
  TableRow,
} from "@/components/ui/table";

export const UserTableHeader = () => {
  return (
    <TableRow className="bg-gray-50">
      <TableHead className="w-[300px] text-right py-4 text-gray-700 font-semibold">معلومات المستخدم</TableHead>
      <TableHead className="text-right py-4 text-gray-700 font-semibold">آخر تسجيل دخول</TableHead>
      <TableHead className="w-[100px] text-center py-4 text-gray-700 font-semibold">الإجراءات</TableHead>
    </TableRow>
  );
};
