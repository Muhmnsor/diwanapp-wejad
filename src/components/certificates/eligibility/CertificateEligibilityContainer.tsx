import { useState } from "react";
import { EligibilityCheckForm } from "./components/EligibilityCheckForm";
import { EligibilityResult } from "./components/EligibilityResult";
import { EligibilityRequirements } from "./components/EligibilityRequirements";
import { useCertificateEligibility } from "@/hooks/certificates/useCertificateEligibility";

interface CertificateEligibilityContainerProps {
  registrationId: string;
  eventId?: string;
  projectId?: string;
}

export const CertificateEligibilityContainer = ({
  registrationId,
  eventId,
  projectId
}: CertificateEligibilityContainerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<{
    isEligible: boolean;
    reason?: string;
    requirements: {
      totalAttendance: number;
      requiredAttendance: number;
      attendancePercentage: number;
      requiredPercentage: number;
    };
  } | null>(null);

  const { checkEligibility } = useCertificateEligibility();

  const handleCheck = async () => {
    setIsLoading(true);
    try {
      const result = await checkEligibility({
        registrationId,
        eventId,
        projectId
      });
      setEligibilityResult(result);
    } catch (error) {
      console.error('Error checking eligibility:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <EligibilityCheckForm 
        onCheck={handleCheck}
        isLoading={isLoading}
      />
      
      {eligibilityResult && (
        <div className="space-y-4">
          <EligibilityResult
            isEligible={eligibilityResult.isEligible}
            reason={eligibilityResult.reason}
          />
          <EligibilityRequirements
            requirements={eligibilityResult.requirements}
          />
        </div>
      )}
    </div>
  );
};