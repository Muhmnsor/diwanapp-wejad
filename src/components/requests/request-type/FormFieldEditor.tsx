
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { requestTypeSchema } from "./schema";
import { Separator } from "@/components/ui/separator";
import { FieldEditor } from "./field-editor/FormFieldEditor";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type RequestTypeFormValues = z.infer<typeof requestTypeSchema>;

interface FormFieldEditorProps {
  form: UseFormReturn<RequestTypeFormValues>;
}

export const FormFieldEditor = ({ form }: FormFieldEditorProps) => {
  const [hasError, setHasError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  React.useEffect(() => {
    // Reset error state when form changes
    setHasError(false);
    setErrorMessage("");
  }, [form]);

  if (!form) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          حدث خطأ في تحميل النموذج. يرجى إعادة تحميل الصفحة.
        </AlertDescription>
      </Alert>
    );
  }

  try {
    return (
      <div className="space-y-4">
        <FieldEditor form={form} />
        <Separator />
      </div>
    );
  } catch (error) {
    console.error("Error rendering FormFieldEditor:", error);
    
    if (!hasError) {
      setHasError(true);
      setErrorMessage(error instanceof Error ? error.message : "خطأ غير معروف");
    }
    
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            حدث خطأ في تحميل محرر الحقول. يرجى المحاولة مرة أخرى.
            {errorMessage && (
              <div className="mt-2 text-xs opacity-60">
                تفاصيل الخطأ: {errorMessage}
              </div>
            )}
          </AlertDescription>
        </Alert>
        <Separator />
      </div>
    );
  }
};
