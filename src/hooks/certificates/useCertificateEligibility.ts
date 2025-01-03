import { useState } from 'react';
import { checkCertificateEligibility, CertificateRequirements } from '@/utils/certificates/certificateRequirements';

export const useCertificateEligibility = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<{
    isEligible: boolean;
    reason: string;
  } | null>(null);

  const checkEligibility = async (requirements: CertificateRequirements) => {
    try {
      setIsChecking(true);
      const result = await checkCertificateEligibility(requirements);
      setEligibilityResult(result);
      return result;
    } catch (error) {
      console.error('Error in useCertificateEligibility:', error);
      setEligibilityResult({
        isEligible: false,
        reason: 'حدث خطأ أثناء التحقق من الأهلية'
      });
      return {
        isEligible: false,
        reason: 'حدث خطأ أثناء التحقق من الأهلية'
      };
    } finally {
      setIsChecking(false);
    }
  };

  return {
    checkEligibility,
    isChecking,
    eligibilityResult
  };
};