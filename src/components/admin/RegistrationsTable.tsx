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
  console.log('Raw registrations received:', registrations);
  
  // Ensure registrations is an array and convert objects to safe string representations
  const registrationsArray = Array.isArray(registrations) 
    ? registrations.map(reg => {
        console.log('Processing registration:', reg);
        
        // Convert the date first
        let formattedDate = '';
        try {
          if (reg.created_at) {
            const date = new Date(reg.created_at);
            formattedDate = date.toLocaleString('ar-SA');
            console.log('Formatted date:', formattedDate);
          }
        } catch (error) {
          console.error('Error formatting date:', error);
          formattedDate = 'Invalid Date';
        }

        // Format registration number to show only the last part after the last hyphen
        const shortRegistrationNumber = reg.registration_number
          ? reg.registration_number.split('-').pop() || reg.registration_number
          : '';

        return {
          id: reg.id || '',
          registration_number: shortRegistrationNumber,
          name: reg.name || '',
          email: reg.email || '',
          phone: reg.phone || '',
          created_at: formattedDate
        };
      })
    : [];

  console.log('Final processed registrations:', registrationsArray);

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
              <TableCell className="text-right">{reg.registration_number}</TableCell>
              <TableCell className="text-right">{reg.name}</TableCell>
              <TableCell className="text-right">{reg.email}</TableCell>
              <TableCell className="text-right">{reg.phone}</TableCell>
              <TableCell className="text-right">{reg.created_at}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};