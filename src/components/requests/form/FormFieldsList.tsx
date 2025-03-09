
import React from "react";
import { FormFieldType } from "../types";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface FormFieldsListProps {
  formFields: FormFieldType[];
  handleEditField: (index: number) => void;
  handleRemoveField: (index: number) => void;
}

export const FormFieldsList: React.FC<FormFieldsListProps> = ({
  formFields,
  handleEditField,
  handleRemoveField,
}) => {
  const getFieldTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      text: "نص",
      textarea: "نص طويل",
      number: "رقم",
      date: "تاريخ",
      select: "قائمة اختيار",
      file: "ملف مرفق",
      array: "قائمة عناصر"
    };
    return types[type] || type;
  };

  if (formFields.length === 0) {
    return null;
  }

  return (
    <div className="border rounded-md p-4 space-y-3">
      <h4 className="text-sm font-medium">حقول النموذج</h4>
      <div className="space-y-2">
        {formFields.map((field, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-muted p-3 rounded-md"
          >
            <div className="flex-1">
              <div className="font-medium">{field.label}</div>
              <div className="text-sm text-muted-foreground">
                {field.name} - {getFieldTypeLabel(field.type)}
                {field.required && " (مطلوب)"}
              </div>
            </div>
            <div className="flex space-x-2 space-x-reverse">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleEditField(index)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-500"
                onClick={() => handleRemoveField(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
