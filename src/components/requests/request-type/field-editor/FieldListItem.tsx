
import React from "react";
import { FormField } from "../../types";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface FieldListItemProps {
  field: FormField;
  onEdit: () => void;
  onRemove: () => void;
}

export const FieldListItem = ({ field, onEdit, onRemove }: FieldListItemProps) => {
  return (
    <div className="flex items-center justify-between bg-muted p-2 rounded">
      <div>
        <span className="font-medium">{field.label}</span>
        <span className="mx-2 text-muted-foreground">({field.name})</span>
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{field.type}</span>
        {field.required && (
          <span className="text-xs bg-red-100 text-red-800 mx-1 px-2 py-0.5 rounded">مطلوب</span>
        )}
      </div>
      <div className="flex items-center space-x-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onEdit}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
};
