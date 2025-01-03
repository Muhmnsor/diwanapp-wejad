import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { SignatureForm } from "./SignatureForm";

interface SignatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signature?: any;
}

export const SignatureDialog = ({
  open,
  onOpenChange,
  signature
}: SignatureDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleFileUpload = async (file: File): Promise<string> => {
    console.log('Uploading signature file:', file.name);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    
    const { error: uploadError, data } = await supabase.storage
      .from('certificate-signatures')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading signature:', uploadError);
      throw uploadError;
    }

    console.log('Signature uploaded successfully:', data);
    return fileName;
  };

  const handleSubmit = async (formData: any, selectedFile: File | null) => {
    setIsLoading(true);
    console.log('Submitting signature form with data:', formData);

    try {
      let signature_image = formData.signature_image;

      if (selectedFile) {
        console.log('New signature file selected, uploading...');
        signature_image = await handleFileUpload(selectedFile);
      }

      const submitData = {
        ...formData,
        signature_image
      };

      console.log('Submitting signature data to database:', submitData);

      if (signature?.id) {
        const { error } = await supabase
          .from('certificate_signatures')
          .update(submitData)
          .eq('id', signature.id);

        if (error) throw error;
        toast.success('تم تحديث التوقيع بنجاح');
      } else {
        const { error } = await supabase
          .from('certificate_signatures')
          .insert([submitData]);

        if (error) throw error;
        toast.success('تم إضافة التوقيع بنجاح');
      }

      await queryClient.invalidateQueries({ queryKey: ['certificate-signatures'] });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving signature:', error);
      toast.error('حدث خطأ أثناء حفظ التوقيع');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {signature ? 'تعديل التوقيع' : 'إضافة توقيع جديد'}
          </DialogTitle>
        </DialogHeader>

        <SignatureForm
          signature={signature}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};