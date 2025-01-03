import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useState } from "react";
import { CertificateTemplateFields } from "../CertificateTemplateFields";

interface CertificateTemplateFormProps {
  template?: any;
  isLoading?: boolean;
  onSubmit: (formData: any, selectedFile: File | null) => Promise<void>;
  onCancel: () => void;
}

export const CertificateTemplateForm = ({
  template,
  isLoading,
  onSubmit,
  onCancel
}: CertificateTemplateFormProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const form = useForm({
    defaultValues: {
      name: template?.name || "",
      description: template?.description || "",
      template_file: template?.template_file || "",
      fields: template?.fields || {},
      is_active: template?.is_active ?? true,
      language: template?.language || "ar",
      orientation: template?.orientation || "portrait",
      page_size: template?.page_size || "A4",
      font_family: template?.font_family || "Arial",
    },
  });

  const handleSubmit = async (formData: any) => {
    await onSubmit(formData, selectedFile);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <CertificateTemplateFields 
          form={form}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {template ? 'تحديث' : 'إضافة'}
          </Button>
        </div>
      </form>
    </Form>
  );
};