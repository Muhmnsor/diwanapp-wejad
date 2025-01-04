import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CertificateVerificationProps {
  verificationCode: string;
}

export const CertificateVerification = ({ verificationCode }: CertificateVerificationProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [certificate, setCertificate] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        setIsLoading(true);
        console.log('🔍 التحقق من الشهادة:', verificationCode);

        // 1. Fetch certificate details
        const { data: certificate, error: certError } = await supabase
          .from('certificates')
          .select(`
            *,
            registrations (
              arabic_name,
              email,
              phone
            )
          `)
          .eq('verification_code', verificationCode)
          .single();

        if (certError) throw certError;
        if (!certificate) throw new Error('الشهادة غير موجودة');

        // 2. Record verification attempt
        const { error: verificationError } = await supabase
          .from('certificate_verifications')
          .insert([{
            certificate_id: certificate.id,
            verification_code: verificationCode,
            verification_method: 'qr',
            ip_address: await fetch('https://api.ipify.org?format=json')
              .then(res => res.json())
              .then(data => data.ip)
          }]);

        if (verificationError) throw verificationError;

        setCertificate(certificate);
        toast.success('تم التحقق من صحة الشهادة');
      } catch (error) {
        console.error('❌ خطأ في التحقق من الشهادة:', error);
        setError('لم يتم العثور على الشهادة أو أنها غير صالحة');
        toast.error('فشل التحقق من صحة الشهادة');
      } finally {
        setIsLoading(false);
      }
    };

    if (verificationCode) {
      verifyCertificate();
    }
  }, [verificationCode]);

  if (isLoading) {
    return (
      <Card className="p-6 text-center">
        <div className="animate-pulse">جاري التحقق من الشهادة...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center text-red-500">
        {error}
      </Card>
    );
  }

  if (!certificate) {
    return null;
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="text-center text-green-600 font-bold text-xl mb-4">
        ✓ هذه الشهادة صحيحة وموثقة
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">تفاصيل الشهادة:</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-gray-600">رقم الشهادة:</div>
          <div>{certificate.certificate_number}</div>
          <div className="text-gray-600">اسم المستفيد:</div>
          <div>{certificate.registrations?.arabic_name}</div>
          <div className="text-gray-600">تاريخ الإصدار:</div>
          <div>{new Date(certificate.issued_at).toLocaleDateString('ar-SA')}</div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 mt-4">
        تم التحقق من هذه الشهادة في {new Date().toLocaleString('ar-SA')}
      </div>
    </Card>
  );
};