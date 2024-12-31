import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import { Edit2, Trash2, X, Check } from "lucide-react";

interface RegistrationActionsProps {
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export const RegistrationActions = ({
  isEditing,
  onEdit,
  onDelete,
  onSave,
  onCancel,
}: RegistrationActionsProps) => {
  return (
    <TableCell className="text-right">
      <div className="flex justify-end gap-2">
        {isEditing ? (
          <>
            <Button
              onClick={onSave}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              onClick={onCancel}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={onEdit}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              onClick={onDelete}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </TableCell>
  );
};