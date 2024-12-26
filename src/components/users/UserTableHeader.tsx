import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const UserTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[300px] text-right">معلومات المستخدم</TableHead>
        <TableHead className="text-right">آخر تسجيل دخول</TableHead>
        <TableHead className="w-[100px] text-right">الإجراءات</TableHead>
      </TableRow>
    </TableHeader>
  );
};