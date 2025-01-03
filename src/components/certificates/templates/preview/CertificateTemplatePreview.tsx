import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PDFDocument } from 'pdf-lib';

interface CertificateTemplatePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: any;
}

export const CertificateTemplatePreview = ({
  open,
  onOpenChange,
  template
}: CertificateTemplatePreviewProps) => {
  const [previewData, setPreviewData] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFieldChange = (key: string, value: string) => {
    setPreviewData(prev => ({ ...prev, [key]: value }));
  };

  const downloadTemplateFile = async () => {
    try {
      console.log('📥 Downloading template file:', template.template_file);
      const { data, error } = await supabase.storage
        .from('certificate-templates')
        .download(template.template_file);

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Error downloading template:', error);
      throw new Error('Failed to download template file');
    }
  };

  const processTemplate = async (pdfBytes: ArrayBuffer) => {
    try {
      console.log('🔄 Processing template with data:', previewData);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();

      // Fill form fields with preview data
      Object.entries(previewData).forEach(([key, value]) => {
        try {
          const field = form.getTextField(key);
          if (field) {
            field.setText(value);
          }
        } catch (error) {
          console.warn(`⚠️ Field not found or error setting value for: ${key}`, error);
        }
      });

      // Flatten form fields
      form.flatten();

      // Save the modified PDF
      const modifiedPdfBytes = await pdfDoc.save();
      return new Blob([modifiedPdfBytes], { type: 'application/pdf' });
    } catch (error) {
      console.error('❌ Error processing template:', error);
      throw new Error('Failed to process template');
    }
  };

  const handlePreview = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Generating preview with data:', previewData);
      
      // Download the template file
      const templateFile = await downloadTemplateFile();
      
      // Process the template with preview data
      const processedPdf = await processTemplate(await templateFile.arrayBuffer());
      
      // Create a temporary URL for preview
      const previewUrl = URL.createObjectURL(processedPdf);
      setPreviewUrl(previewUrl);
      
      toast.success('تم إنشاء المعاينة بنجاح');
    } catch (error) {
      console.error('❌ خطأ في إنشاء المعاينة:', error);
      toast.error('حدث خطأ أثناء إنشاء المعاينة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      console.log('⬇️ جاري تحميل المعاينة...');
      
      // Download the template file
      const templateFile = await downloadTemplateFile();
      
      // Process the template with preview data
      const processedPdf = await processTemplate(await templateFile.arrayBuffer());
      
      // Create a download link
      const downloadUrl = URL.createObjectURL(processedPdf);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `preview-${template.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      URL.revokeObjectURL(downloadUrl);
      
      toast.success('تم تحميل المعاينة بنجاح');
    } catch (error) {
      console.error('❌ خطأ في تحميل المعاينة:', error);
      toast.error('حدث خطأ أثناء تحميل المعاينة');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>معاينة القالب</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4">
            {Object.entries(template.fields).map(([key, value]) => (
              <div key={key}>
                <Label>{value as string}</Label>
                <Input
                  value={previewData[key] || ''}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  placeholder={`أدخل ${value as string}`}
                />
              </div>
            ))}
          </div>

          {previewUrl && (
            <div className="aspect-video w-full overflow-hidden rounded-lg border">
              <iframe 
                src={previewUrl} 
                className="h-full w-full"
                title="معاينة القالب"
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              إغلاق
            </Button>
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4 ml-2" />
              )}
              معاينة
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4 ml-2" />
              )}
              تحميل
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};