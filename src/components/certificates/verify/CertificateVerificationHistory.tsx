
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CertificateVerificationHistoryProps {
  certificateId: string;
}

export const CertificateVerificationHistory = ({ certificateId }: CertificateVerificationHistoryProps) => {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVerificationHistory = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('certificate_verifications')
          .select('*')
          .eq('certificate_id', certificateId)
          .order('verified_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setHistory(data || []);
      } catch (error) {
        console.error('Error fetching verification history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (certificateId) {
      fetchVerificationHistory();
    }
  }, [certificateId]);

  if (isLoading) {
    return <div className="text-center p-4">جاري التحميل...</div>;
  }

  if (history.length === 0) {
    return <div className="text-center p-4 text-sm text-muted-foreground">لا يوجد سجل تحقق سابق</div>;
  }

  return (
    <div className="mt-4 space-y-2">
      <h4 className="text-sm font-medium mb-2">آخر عمليات التحقق:</h4>
      <div className="space-y-2">
        {history.map((verification) => (
          <div key={verification.id} className="text-xs text-muted-foreground flex justify-between">
            <span>
              {verification.verification_method === 'qr' ? 'تحقق بواسطة QR' : 'تحقق مباشر'}
            </span>
            <span>
              {new Date(verification.verified_at).toLocaleString('ar-SA')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
