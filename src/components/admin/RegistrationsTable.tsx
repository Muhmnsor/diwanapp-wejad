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
  console.log('Registrations received in table:', registrations);
  
  // Ensure registrations is an array and convert objects to safe string representations
  const registrationsArray = Array.isArray(registrations) 
    ? registrations.map(reg => ({
        ...reg,
        created_at: reg.created_at ? new Date(reg.created_at).toLocaleString('ar-SA') : ''
      }))
    : [];

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
          {registrationsArray.map((reg) => (
            <TableRow key={reg.id}>
              <TableCell>{reg.registration_number || ''}</TableCell>
              <TableCell>{reg.name || ''}</TableCell>
              <TableCell>{reg.email || ''}</TableCell>
              <TableCell>{reg.phone || ''}</TableCell>
              <TableCell>{reg.created_at || ''}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};