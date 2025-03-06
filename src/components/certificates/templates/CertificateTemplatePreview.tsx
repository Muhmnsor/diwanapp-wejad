
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PreviewFields } from "./preview/components/PreviewFields";
import { PreviewDisplay } from "./preview/components/PreviewDisplay";
import { PreviewActions } from "./preview/components/PreviewActions";
import { downloadTemplateFile } from "./preview/utils/templateDownloader";
import { processTemplate } from "./preview/utils/templateProcessor";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Copy } from "lucide-react";

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Real-time preview generation
  useEffect(() => {
    if (open && Object.keys(previewData).length > 0) {
      const timer = setTimeout(() => {
        handlePreview(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [previewData, open]);

  const handleFieldChange = (key: string, value: string) => {
    setPreviewData(prev => ({ ...prev, [key]: value }));
    setIsGenerating(true);
  };

  const handlePreview = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      console.log('🔄 توليد معاينة بالبيانات:', previewData);
      
      const templateFile = await downloadTemplateFile(template.template_file);
      const processedPdf = await processTemplate(await templateFile.arrayBuffer(), previewData);
      
      // Revoke old URL to prevent memory leaks
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      const newPreviewUrl = URL.createObjectURL(processedPdf);
      setPreviewUrl(newPreviewUrl);
      
      if (!silent) toast.success('تم إنشاء المعاينة بنجاح');
    } catch (error) {
      console.error('❌ خطأ في إنشاء المعاينة:', error);
      if (!silent) toast.error('حدث خطأ أثناء إنشاء المعاينة');
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
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

  const handleDuplicateTemplate = async () => {
    try {
      setIsLoading(true);
      // Create a new template based on the current one
      const newTemplate = {
        ...template,
        name: `نسخة من ${template.name}`,
        id: undefined,
        created_at: undefined,
        updated_at: undefined
      };
      
      delete newTemplate.id;
      delete newTemplate.created_at;
      delete newTemplate.updated_at;

      const { error } = await supabase
        .from('certificate_templates')
        .insert([newTemplate]);

      if (error) throw error;
      
      toast.success('تم نسخ القالب بنجاح');
      queryClient.invalidateQueries({ queryKey: ['certificate-templates'] });
    } catch (error) {
      console.error('❌ خطأ في نسخ القالب:', error);
      toast.error('حدث خطأ أثناء نسخ القالب');
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
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>معاينة القالب: {template.name}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDuplicateTemplate}
              disabled={isLoading}
              className="gap-1"
            >
              <Copy className="h-4 w-4" />
              نسخ القالب
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <PreviewFields
                fields={template.fields}
                previewData={previewData}
                onFieldChange={handleFieldChange}
              />
            </div>
            
            <div className="lg:col-span-2">
              <PreviewDisplay 
                previewUrl={previewUrl} 
                isLoading={isLoading}
                isGenerating={isGenerating}
                onRefresh={() => handlePreview()}
              />
            </div>
          </div>

          <PreviewActions
            onPreview={() => handlePreview()}
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
