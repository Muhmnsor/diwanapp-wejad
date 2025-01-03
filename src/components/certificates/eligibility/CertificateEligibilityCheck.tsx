import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X, Loader2 } from "lucide-react";
import { useCertificateEligibility } from "@/hooks/certificates/useCertificateEligibility";
import { toast } from "sonner";

interface CertificateEligibilityCheckProps {
  registrationId: string;
  eventId?: string;
  projectId?: string;
}

export const CertificateEligibilityCheck = ({
  registrationId,
  eventId,
  projectId
}: CertificateEligibilityCheckProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const { checkEligibility } = useCertificateEligibility();

  const handleCheck = async () => {
    setIsChecking(true);
    try {
      const result = await checkEligibility({
        registrationId,
        eventId,
        projectId
      });

      if (result.isEligible) {
        toast.success("المشارك مؤهل للحصول على الشهادة");
      } else {
        toast.error(result.reason || "المشارك غير مؤهل للحصول على الشهادة");
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
      toast.error("حدث خطأ أثناء التحقق من الأهلية");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">التحقق من أهلية الشهادة</h3>
        <Button
          onClick={handleCheck}
          disabled={isChecking}
          variant="outline"
          className="flex items-center gap-2"
        >
          {isChecking ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              جاري التحقق...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              التحقق من الأهلية
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};