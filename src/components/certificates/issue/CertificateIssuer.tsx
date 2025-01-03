import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { processTemplate } from "../templates/preview/utils/templateProcessor";
import { downloadTemplateFile } from "../templates/preview/utils/templateDownloader";

interface CertificateIssuerProps {
  templateId: string;
  registrationId: string;
  eventId?: string;
  projectId?: string;
}

export const CertificateIssuer = ({
  templateId,
  registrationId,
  eventId,
  projectId
}: CertificateIssuerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [certificateData, setCertificateData] = useState<Record<string, string>>({});

  const handleFieldChange = (key: string, value: string) => {
    setCertificateData(prev => ({ ...prev, [key]: value }));
  };

  const handleIssueCertificate = async () => {
    try {
      setIsLoading(true);
      console.log('🎓 Issuing certificate with data:', { templateId, registrationId, certificateData });

      // 1. Get template details
      const { data: template, error: templateError } = await supabase
        .from('certificate_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;

      // 2. Process template with data
      const templateFile = await downloadTemplateFile(template.template_file);
      const processedPdf = await processTemplate(await templateFile.arrayBuffer(), certificateData);

      // 3. Upload processed PDF to storage
      const fileName = `${crypto.randomUUID()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(fileName, processedPdf);

      if (uploadError) throw uploadError;

      // 4. Create certificate record
      const { error: insertError } = await supabase
        .from('certificates')
        .insert([{
          template_id: templateId,
          registration_id: registrationId,
          event_id: eventId,
          project_id: projectId,
          certificate_number: `CERT-${Date.now()}`,
          verification_code: crypto.randomUUID().split('-')[0].toUpperCase(),
          certificate_data: certificateData,
          pdf_url: fileName
        }]);

      if (insertError) throw insertError;

      toast.success('تم إصدار الشهادة بنجاح');
    } catch (error) {
      console.error('❌ Error issuing certificate:', error);
      toast.error('حدث خطأ أثناء إصدار الشهادة');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-semibold">إصدار شهادة جديدة</h3>

      <div className="space-y-4">
        {Object.entries(certificateData).map(([key, value]) => (
          <div key={key} className="space-y-2">
            <Label>{key}</Label>
            <Input
              value={value}
              onChange={(e) => handleFieldChange(key, e.target.value)}
              placeholder={`أدخل ${key}`}
            />
          </div>
        ))}
      </div>

      <Button
        onClick={handleIssueCertificate}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'جاري الإصدار...' : 'إصدار الشهادة'}
      </Button>
    </Card>
  );
};