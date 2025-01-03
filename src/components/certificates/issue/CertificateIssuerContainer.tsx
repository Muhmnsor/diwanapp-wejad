import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CertificateIssuer } from "./CertificateIssuer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface CertificateIssuerContainerProps {
  registrationId: string;
  eventId?: string;
  projectId?: string;
}

export const CertificateIssuerContainer = ({
  registrationId,
  eventId,
  projectId
}: CertificateIssuerContainerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        console.log('🔍 Fetching template for:', { eventId, projectId });
        
        // Get event or project details to find certificate type
        const table = eventId ? 'events' : 'projects';
        const id = eventId || projectId;

        const { data: entity, error: entityError } = await supabase
          .from(table)
          .select('certificate_type')
          .eq('id', id)
          .single();

        if (entityError) throw entityError;

        if (!entity.certificate_type || entity.certificate_type === 'none') {
          throw new Error('الشهادات غير متاحة لهذا النشاط');
        }

        // Get active template
        const { data: template, error: templateError } = await supabase
          .from('certificate_templates')
          .select('id')
          .eq('is_active', true)
          .single();

        if (templateError) throw templateError;

        setTemplateId(template.id);
      } catch (error) {
        console.error('❌ Error fetching template:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplate();
  }, [eventId, projectId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!templateId) {
    return (
      <Alert>
        <AlertDescription>لم يتم العثور على قالب نشط للشهادات</AlertDescription>
      </Alert>
    );
  }

  return (
    <CertificateIssuer
      templateId={templateId}
      registrationId={registrationId}
      eventId={eventId}
      projectId={projectId}
    />
  );
};