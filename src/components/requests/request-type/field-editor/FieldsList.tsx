
import React from "react";
import { FormField } from "../../types";
import { FieldListItem } from "./FieldListItem";

interface FieldsListProps {
  formFields: FormField[];
  handleEditField: (index: number) => void;
  handleRemoveField: (index: number) => void;
}

export const FieldsList = ({ formFields, handleEditField, handleRemoveField }: FieldsListProps) => {
  if (formFields.length === 0) {
    return <p className="text-sm text-muted-foreground">لم يتم إضافة أي حقول بعد</p>;
  }

  return (
    <div className="space-y-2">
      {formFields.map((field, index) => (
        <FieldListItem
          key={index}
          field={field}
          onEdit={() => handleEditField(index)}
          onRemove={() => handleRemoveField(index)}
        />
      ))}
    </div>
  );
};
