import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Pencil, Check, X } from "lucide-react";

interface RegistrationTableRowProps {
  registration: any;
  editingId: string | null;
  editForm: {
    name: string;
    email: string;
    phone: string;
  };
  loading: boolean;
  onEdit: (registration: any) => void;
  onDelete: (id: string) => void;
  onSave: (id: string) => void;
  onCancel: () => void;
  onEditFormChange: (field: string, value: string) => void;
}

export const RegistrationTableRow = ({
  registration,
  editingId,
  editForm,
  loading,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onEditFormChange,
}: RegistrationTableRowProps) => {
  console.log('Registration data:', registration);
  console.log('Edit form data:', editForm);
  
  return (
    <TableRow key={registration.id} className="hover:bg-gray-50">
      <TableCell className="font-medium">
        {editingId === registration.id ? (
          <Input
            value={editForm.name}
            onChange={(e) => onEditFormChange("name", e.target.value)}
            className="w-full text-right"
          />
        ) : (
          registration.arabic_name || "لا يوجد اسم"
        )}
      </TableCell>
      <TableCell>
        {editingId === registration.id ? (
          <Input
            value={editForm.email}
            onChange={(e) => onEditFormChange("email", e.target.value)}
            className="w-full text-right"
            dir="ltr"
          />
        ) : (
          registration.email || "لا يوجد بريد إلكتروني"
        )}
      </TableCell>
      <TableCell>
        {editingId === registration.id ? (
          <Input
            value={editForm.phone}
            onChange={(e) => onEditFormChange("phone", e.target.value)}
            className="w-full text-right"
            dir="ltr"
          />
        ) : (
          registration.phone || "لا يوجد رقم جوال"
        )}
      </TableCell>
      <TableCell>{registration.registration_number}</TableCell>
      <TableCell>
        {new Date(registration.created_at).toLocaleDateString("ar-SA")}
      </TableCell>
      <TableCell className="text-center">
        <div className="flex gap-2 justify-center">
          {editingId === registration.id ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSave(registration.id)}
                className="h-8 w-8 p-0"
                disabled={loading}
              >
                <Check className="h-4 w-4 text-green-500" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="h-8 w-8 p-0"
                disabled={loading}
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(registration)}
                className="h-8 w-8 p-0"
                disabled={loading}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-red-50 hover:text-red-500"
                onClick={() => onDelete(registration.id)}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};