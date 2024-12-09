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
        // Ensure created_at is a string before trying to convert it
        created_at: typeof reg.created_at === 'string' 
          ? new Date(reg.created_at).toLocaleString('ar-SA') 
          : ''
      }))
    : [];

  console.log('Processed registrations array:', registrationsArray);

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
              <TableCell>{String(reg.registration_number || '')}</TableCell>
              <TableCell>{String(reg.name || '')}</TableCell>
              <TableCell>{String(reg.email || '')}</TableCell>
              <TableCell>{String(reg.phone || '')}</TableCell>
              <TableCell>{String(reg.created_at || '')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};