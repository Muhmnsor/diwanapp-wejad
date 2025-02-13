import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { processTemplate } from "../templates/preview/utils/templateProcessor";
import { downloadTemplateFile } from "../templates/preview/utils/templateDownloader";
import { CertificateTemplatePreview } from "../templates/preview/CertificateTemplatePreview";
import { CertificateFields } from "./CertificateFields";
import { CertificateActions } from "./CertificateActions";

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
  const [showPreview, setShowPreview] = useState(false);
  const [template, setTemplate] = useState<any>(null);
  const [registrationData, setRegistrationData] = useState<any>(null);

  // Fetch template and registration data
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 Fetching template and registration data...');
        
        // Fetch template
        const { data: templateData, error: templateError } = await supabase
          .from('certificate_templates')
          .select('*')
          .eq('id', templateId)
          .single();

        if (templateError) throw templateError;
        
        setTemplate(templateData);
        setCertificateData(templateData.fields || {});

        // Fetch registration data
        const { data: regData, error: regError } = await supabase
          .from('registrations')
          .select('*')
          .eq('id', registrationId)
          .single();

        if (regError) throw regError;
        
        console.log('✅ Data fetched successfully:', { template: templateData, registration: regData });
        setRegistrationData(regData);
      } catch (error) {
        console.error('❌ Error fetching data:', error);
        toast.error('حدث خطأ أثناء تحميل البيانات');
      }
    };

    fetchData();
  }, [templateId, registrationId]);

  const handleFieldChange = (key: string, value: string) => {
    setCertificateData(prev => ({ ...prev, [key]: value }));
  };

  const validateCertificateData = () => {
    // Check for empty required fields
    const emptyFields = Object.entries(certificateData)
      .filter(([_, value]) => !value.trim())
      .map(([key]) => key);

    if (emptyFields.length > 0) {
      toast.error(`الرجاء ملء الحقول التالية: ${emptyFields.join(', ')}`);
      return false;
    }

    return true;
  };

  const generateVerificationUrl = (verificationCode: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/verify-certificate/${verificationCode}`;
  };

  const handlePreview = async () => {
    if (!validateCertificateData()) return;
    setShowPreview(true);
  };

  const handleIssueCertificate = async (confirmedData: Record<string, string>) => {
    try {
      setIsLoading(true);
      console.log('🎓 إصدار شهادة بالبيانات:', { templateId, registrationId, confirmedData });

      const templateFile = await downloadTemplateFile(template.template_file);
      const processedPdf = await processTemplate(await templateFile.arrayBuffer(), confirmedData);

      const verificationCode = crypto.randomUUID().split('-')[0].toUpperCase();
      const verificationUrl = generateVerificationUrl(verificationCode);
      
      const fileName = `${crypto.randomUUID()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(fileName, processedPdf);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from('certificates')
        .insert([{
          template_id: templateId,
          registration_id: registrationId,
          event_id: eventId,
          project_id: projectId,
          certificate_number: `CERT-${Date.now()}`,
          verification_code: verificationCode,
          certificate_data: confirmedData,
          pdf_url: fileName,
          qr_code: verificationUrl
        }]);

      if (insertError) throw insertError;

      toast.success('تم إصدار الشهادة بنجاح');
      setShowPreview(false);
    } catch (error) {
      console.error('❌ خطأ في إصدار الشهادة:', error);
      toast.error('حدث خطأ أثناء إصدار الشهادة');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-semibold">إصدار شهادة جديدة</h3>

      <CertificateFields 
        certificateData={certificateData}
        onFieldChange={handleFieldChange}
        fieldMappings={template?.field_mappings}
        registrationData={registrationData}
      />

      <CertificateActions 
        onPreview={handlePreview}
        isLoading={isLoading}
      />

      {template && (
        <CertificateTemplatePreview
          open={showPreview}
          onOpenChange={setShowPreview}
          template={template}
          initialData={certificateData}
          onConfirm={handleIssueCertificate}
          showConfirm={true}
        />
      )}
    </Card>
  );
};