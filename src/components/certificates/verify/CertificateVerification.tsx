
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";
import { CertificateVerificationHistory } from "./CertificateVerificationHistory";
import { Button } from "@/components/ui/button";

interface CertificateVerificationProps {
  verificationCode: string;
}

export const CertificateVerification = ({ verificationCode }: CertificateVerificationProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [certificate, setCertificate] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

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
            ),
            event:event_id (
              title,
              date
            ),
            project:project_id (
              title
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
              .catch(() => 'unknown')
          }]);

        if (verificationError) {
          console.error('Error recording verification:', verificationError);
          // Continue anyway - don't throw
        }

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

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ar-SA');
    } catch (e) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 text-center">
        <div className="animate-pulse">جاري التحقق من الشهادة...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold text-red-500">تعذر التحقق</h2>
          <p className="text-red-500">{error}</p>
        </div>
      </Card>
    );
  }

  if (!certificate) {
    return null;
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex flex-col items-center text-center mb-6">
        <CheckCircle className="h-12 w-12 text-green-600 mb-2" />
        <h2 className="text-xl font-bold text-green-600">
          هذه الشهادة صحيحة وموثقة
        </h2>
        <Badge className="mt-2" variant="secondary">
          {certificate.status === 'active' ? 'سارية المفعول' : 'منتهية الصلاحية'}
        </Badge>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">تفاصيل الشهادة:</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-gray-600">رقم الشهادة:</div>
          <div className="font-medium">{certificate.certificate_number}</div>
          
          <div className="text-gray-600">اسم المستفيد:</div>
          <div className="font-medium">{certificate.registrations?.arabic_name}</div>
          
          <div className="text-gray-600">الفعالية/المشروع:</div>
          <div className="font-medium">
            {certificate.event?.title || certificate.project?.title || 'غير محدد'}
          </div>
          
          <div className="text-gray-600">تاريخ الإصدار:</div>
          <div className="font-medium">{formatDate(certificate.issued_at)}</div>
          
          {certificate.event?.date && (
            <>
              <div className="text-gray-600">تاريخ الفعالية:</div>
              <div className="font-medium">{certificate.event.date}</div>
            </>
          )}
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        <Button 
          variant="outline" 
          onClick={() => setShowHistory(!showHistory)}
          className="w-full"
        >
          {showHistory ? 'إخفاء سجل التحقق' : 'عرض سجل التحقق'}
        </Button>
        
        {showHistory && (
          <CertificateVerificationHistory certificateId={certificate.id} />
        )}
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-6">
        <Clock className="h-4 w-4" />
        <span>تم التحقق في {new Date().toLocaleString('ar-SA')}</span>
      </div>
    </Card>
  );
};
