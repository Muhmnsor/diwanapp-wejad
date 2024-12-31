import { TableCell } from "@/components/ui/table";

interface RegistrationContactProps {
  email: string;
  phone: string;
  isEditing: boolean;
  editForm: {
    email: string;
    phone: string;
  };
  onEditFormChange: (field: string, value: string) => void;
}

export const RegistrationContact = ({
  email,
  phone,
  isEditing,
  editForm,
  onEditFormChange,
}: RegistrationContactProps) => {
  console.log('RegistrationContact - Email:', email);
  console.log('RegistrationContact - Phone:', phone);

  if (isEditing) {
    return (
      <>
        <TableCell>
          <input
            type="email"
            value={editForm.email}
            onChange={(e) => onEditFormChange("email", e.target.value)}
            className="w-full p-2 border rounded"
          />
        </TableCell>
        <TableCell>
          <input
            type="tel"
            value={editForm.phone}
            onChange={(e) => onEditFormChange("phone", e.target.value)}
            className="w-full p-2 border rounded"
          />
        </TableCell>
      </>
    );
  }

  return (
    <>
      <TableCell>{email || "لا يوجد بريد إلكتروني"}</TableCell>
      <TableCell>{phone || "لا يوجد رقم هاتف"}</TableCell>
    </>
  );
};