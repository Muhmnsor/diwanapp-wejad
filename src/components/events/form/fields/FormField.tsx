import { Label } from "@/components/ui/label";
import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
}

export const FormField = ({ label, required = false, children }: FormFieldProps) => {
  return (
    <div className="space-y-2 text-right">
      <Label className="block text-sm font-medium">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </Label>
      {children}
    </div>
  );
};