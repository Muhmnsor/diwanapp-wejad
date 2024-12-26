import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const UserTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[300px] text-right pr-6">معلومات المستخدم</TableHead>
        <TableHead className="text-right pr-6">آخر تسجيل دخول</TableHead>
        <TableHead className="w-[100px] text-right pr-6">الإجراءات</TableHead>
      </TableRow>
    </TableHeader>
  );
};