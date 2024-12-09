import { Registration } from "./types";

interface RegistrationsTableProps {
  registrations: Registration[];
}

export const RegistrationsTable = ({ registrations }: RegistrationsTableProps) => {
  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-2 text-right">رقم التسجيل</th>
            <th className="p-2 text-right">الاسم</th>
            <th className="p-2 text-right">البريد الإلكتروني</th>
            <th className="p-2 text-right">رقم الجوال</th>
            <th className="p-2 text-right">تاريخ التسجيل</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((reg) => (
            <tr key={reg.id} className="border-b">
              <td className="p-2">{reg.registration_number}</td>
              <td className="p-2">{reg.name}</td>
              <td className="p-2">{reg.email}</td>
              <td className="p-2">{reg.phone}</td>
              <td className="p-2">
                {new Date(reg.created_at).toLocaleString('ar-SA')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};