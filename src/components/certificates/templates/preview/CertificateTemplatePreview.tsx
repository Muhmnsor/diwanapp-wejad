import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  const handleFieldChange = (key: string, value: string) => {
    setPreviewData(prev => ({ ...prev, [key]: value }));
  };

  const handlePreview = () => {
    // سيتم إضافة منطق المعاينة لاحقاً
    console.log('Preview data:', previewData);
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
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              إغلاق
            </Button>
            <Button onClick={handlePreview}>
              معاينة
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};