
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface RequestFormDataProps {
  formData: Record<string, any>;
  formSchema?: Record<string, any>;
}

export const RequestFormData = ({ formData, formSchema }: RequestFormDataProps) => {
  if (!formData || Object.keys(formData).length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        لا توجد بيانات مدخلة في هذا الطلب
      </div>
    );
  }

  // Format field value based on its type
  const formatFieldValue = (field: string, value: any) => {
    if (value === null || value === undefined) return "غير محدد";
    
    // Check if schema exists and has type information
    const fieldSchema = formSchema?.fields?.find(f => f.name === field);
    const fieldType = fieldSchema?.type || typeof value;
    
    if (value === true) return "نعم";
    if (value === false) return "لا";
    
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    
    // Handle date types
    if (fieldType === "date" && typeof value === "string") {
      try {
        const date = new Date(value);
        return date.toLocaleDateString("ar-SA");
      } catch (e) {
        return value;
      }
    }
    
    return value;
  };

  // Get a readable field name if available in the schema
  const getFieldLabel = (field: string) => {
    if (!formSchema?.fields) return field;
    
    const fieldConfig = formSchema.fields.find(f => f.name === field);
    return fieldConfig?.label || field;
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-medium text-lg mb-4">بيانات الطلب</h3>
        <div className="space-y-3">
          {Object.entries(formData).map(([field, value]) => (
            <div key={field} className="py-2">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground mb-1">
                  {getFieldLabel(field)}
                </span>
                <span className="text-base">
                  {formatFieldValue(field, value)}
                </span>
              </div>
              <Separator className="mt-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
