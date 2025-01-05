import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { CertificateTemplateForm } from "./form/CertificateTemplateForm";

interface CertificateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: any;
}

export const CertificateTemplateDialog = ({
  open,
  onOpenChange,
  template
}: CertificateTemplateDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleFileUpload = async (file: File): Promise<string> => {
    console.log('Uploading file:', file.name);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    
    const { error: uploadError, data } = await supabase.storage
      .from('certificate-templates')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw uploadError;
    }

    console.log('File uploaded successfully:', data);
    return fileName;
  };

  const handleSubmit = async (formData: any, selectedFile: File | null) => {
    setIsLoading(true);
    console.log('Submitting form with data:', formData);

    try {
      let template_file = formData.template_file;

      if (selectedFile) {
        console.log('New file selected, uploading...');
        template_file = await handleFileUpload(selectedFile);
      }

      const submitData = {
        ...formData,
        template_file,
        fields: formData.fields || {},
        field_mappings: formData.field_mappings || {}
      };

      console.log('Submitting data to database:', submitData);

      if (template?.id) {
        const { error } = await supabase
          .from('certificate_templates')
          .update(submitData)
          .eq('id', template.id);

        if (error) throw error;
        toast.success('تم تحديث القالب بنجاح');
      } else {
        const { error } = await supabase
          .from('certificate_templates')
          .insert([submitData]);

        if (error) throw error;
        toast.success('تم إضافة القالب بنجاح');
      }

      await queryClient.invalidateQueries({ queryKey: ['certificate-templates'] });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('حدث خطأ أثناء حفظ القالب');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {template ? 'تعديل قالب الشهادة' : 'إضافة قالب شهادة جديد'}
          </DialogTitle>
        </DialogHeader>

        <CertificateTemplateForm
          template={template}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};