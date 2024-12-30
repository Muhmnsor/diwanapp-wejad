import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const RegistrationTableHeader = () => {
  return (
    <TableHeader className="bg-gray-50">
      <TableRow>
        <TableHead className="text-right font-semibold">الاسم</TableHead>
        <TableHead className="text-right font-semibold">البريد الإلكتروني</TableHead>
        <TableHead className="text-right font-semibold">رقم الجوال</TableHead>
        <TableHead className="text-right font-semibold">رقم التسجيل</TableHead>
        <TableHead className="text-right font-semibold">تاريخ التسجيل</TableHead>
        <TableHead className="text-center font-semibold w-[100px]">إجراءات</TableHead>
      </TableRow>
    </TableHeader>
  );
};