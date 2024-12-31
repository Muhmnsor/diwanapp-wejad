import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const RegistrationTableHeader = () => {
  return (
    <TableHeader className="bg-gray-50">
      <TableRow>
        <TableHead className="text-right font-semibold">الاسم بالعربية</TableHead>
        <TableHead className="text-right font-semibold">الاسم بالإنجليزية</TableHead>
        <TableHead className="text-right font-semibold">البريد الإلكتروني</TableHead>
        <TableHead className="text-right font-semibold">رقم الجوال</TableHead>
        <TableHead className="text-right font-semibold">المستوى التعليمي</TableHead>
        <TableHead className="text-right font-semibold">تاريخ الميلاد</TableHead>
        <TableHead className="text-right font-semibold">رقم الهوية</TableHead>
        <TableHead className="text-right font-semibold">الجنس</TableHead>
        <TableHead className="text-right font-semibold">الحالة الوظيفية</TableHead>
        <TableHead className="text-right font-semibold">رقم التسجيل</TableHead>
        <TableHead className="text-right font-semibold">تاريخ التسجيل</TableHead>
        <TableHead className="text-center font-semibold w-[100px]">إجراءات</TableHead>
      </TableRow>
    </TableHeader>
  );
};