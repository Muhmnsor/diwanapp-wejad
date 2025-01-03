import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { PreviewFields } from "./components/PreviewFields";
import { PreviewDisplay } from "./components/PreviewDisplay";
import { PreviewActions } from "./components/PreviewActions";
import { downloadTemplateFile } from "./utils/templateDownloader";
import { processTemplate } from "./utils/templateProcessor";

interface CertificateTemplatePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: any;
  initialData?: Record<string, string>;
  onConfirm?: (data: Record<string, string>) => void;
  showConfirm?: boolean;
}

export const CertificateTemplatePreview = ({
  open,
  onOpenChange,
  template,
  initialData = {},
  onConfirm,
  showConfirm = false
}: CertificateTemplatePreviewProps) => {
  const [previewData, setPreviewData] = useState<Record<string, string>>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFieldChange = (key: string, value: string) => {
    setPreviewData(prev => ({ ...prev, [key]: value }));
  };

  const handlePreview = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 توليد معاينة بالبيانات:', previewData);
      
      const templateFile = await downloadTemplateFile(template.template_file);
      const processedPdf = await processTemplate(await templateFile.arrayBuffer(), previewData);
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
      
      const templateFile = await downloadTemplateFile(template.template_file);
      const processedPdf = await processTemplate(await templateFile.arrayBuffer(), previewData);
      
      const downloadUrl = URL.createObjectURL(processedPdf);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `preview-${template.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(downloadUrl);
      toast.success('تم تحميل المعاينة بنجاح');
    } catch (error) {
      console.error('❌ خطأ في تحميل المعاينة:', error);
      toast.error('حدث خطأ أثناء تحميل المعاينة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(previewData);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>معاينة القالب</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <PreviewFields
            fields={template.fields}
            previewData={previewData}
            onFieldChange={handleFieldChange}
          />

          <PreviewDisplay 
            previewUrl={previewUrl} 
            isLoading={isLoading}
          />

          <PreviewActions
            onPreview={handlePreview}
            onDownload={handleDownload}
            onClose={() => onOpenChange(false)}
            onConfirm={showConfirm ? handleConfirm : undefined}
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};