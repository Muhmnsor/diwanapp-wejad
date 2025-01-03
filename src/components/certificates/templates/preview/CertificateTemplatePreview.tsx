import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";

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

  const handleFieldChange = (key: string, value: string) => {
    setPreviewData(prev => ({ ...prev, [key]: value }));
  };

  const handlePreview = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Generating preview with data:', previewData);
      
      // سيتم إضافة منطق المعاينة لاحقاً
      await new Promise(resolve => setTimeout(resolve, 1000)); // محاكاة التحميل
      
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
      
      // سيتم إضافة منطق التحميل لاحقاً
      await new Promise(resolve => setTimeout(resolve, 1000)); // محاكاة التحميل
      
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