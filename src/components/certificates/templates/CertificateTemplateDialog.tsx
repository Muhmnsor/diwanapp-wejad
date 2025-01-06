import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { CertificateTemplateForm } from "./form/CertificateTemplateForm";
import { PDFDocument } from 'pdf-lib';

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

  const readPDFFields = async (file: File): Promise<string[]> => {
    try {
      console.log('Reading PDF fields from:', file.name);
      const arrayBuffer = await file.arrayBuffer();
      
      // Add validation for PDF file
      if (arrayBuffer.byteLength === 0) {
        throw new Error('PDF file is empty');
      }

      const pdfDoc = await PDFDocument.load(arrayBuffer);
      if (!pdfDoc) {
        throw new Error('Failed to load PDF document');
      }

      const form = pdfDoc.getForm();
      const fields = form.getFields();
      
      const fieldNames = fields.map(field => {
        const name = field.getName();
        console.log('Found field:', name, 'Type:', field.constructor.name);
        return name;
      });

      console.log('Total fields found:', fieldNames.length);
      
      if (fieldNames.length === 0) {
        toast.warning('لم يتم العثور على حقول في ملف PDF');
      } else {
        toast.success(`تم العثور على ${fieldNames.length} حقل`);
      }
      
      return fieldNames;
    } catch (error) {
      console.error('Error reading PDF fields:', error);
      toast.error('حدث خطأ أثناء قراءة حقول ملف PDF');
      return [];
    }
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    console.log('Uploading file:', file.name);
    
    if (!file.type.includes('pdf')) {
      throw new Error('يجب أن يكون الملف بصيغة PDF');
    }
    
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
      let fields = formData.fields || {};

      if (selectedFile) {
        console.log('New file selected, uploading...');
        template_file = await handleFileUpload(selectedFile);
        
        // Read fields from the PDF file
        const pdfFields = await readPDFFields(selectedFile);
        
        // Create initial fields object with empty values
        if (pdfFields.length > 0) {
          pdfFields.forEach(fieldName => {
            if (!fields[fieldName]) {
              fields[fieldName] = '';
            }
          });
          console.log('Updated fields object:', fields);
        }
      }

      const submitData = {
        ...formData,
        template_file,
        fields,
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