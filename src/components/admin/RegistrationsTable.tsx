import { Registration } from "./types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RegistrationsTableProps {
  registrations: Registration[];
}

export const RegistrationsTable = ({ registrations }: RegistrationsTableProps) => {
  if (!Array.isArray(registrations)) {
    console.error('Registrations is not an array:', registrations);
    return <div>خطأ في تحميل البيانات</div>;
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ar-SA');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'تاريخ غير صالح';
    }
  };

  const formatRegistrationNumber = (number: string) => {
    return number.split('-').pop() || number;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">رقم التسجيل</TableHead>
            <TableHead className="text-right">الاسم</TableHead>
            <TableHead className="text-right">البريد الإلكتروني</TableHead>
            <TableHead className="text-right">رقم الجوال</TableHead>
            <TableHead className="text-right">تاريخ التسجيل</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((registration) => (
            <TableRow key={registration.id}>
              <TableCell className="text-right">
                {formatRegistrationNumber(registration.registration_number)}
              </TableCell>
              <TableCell className="text-right">{registration.name}</TableCell>
              <TableCell className="text-right">{registration.email}</TableCell>
              <TableCell className="text-right">{registration.phone}</TableCell>
              <TableCell className="text-right">
                {formatDate(registration.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};