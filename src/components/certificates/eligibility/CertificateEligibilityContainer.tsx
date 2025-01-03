import { useState } from "react";
import { CertificateEligibilityCheck } from "./CertificateEligibilityCheck";
import { EligibilityStatus } from "./EligibilityStatus";
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

  const handleEligibilityCheck = async (result: any) => {
    setEligibilityResult(result);
  };

  return (
    <div className="space-y-4">
      <CertificateEligibilityCheck
        registrationId={registrationId}
        eventId={eventId}
        projectId={projectId}
      />
      
      {eligibilityResult && (
        <EligibilityStatus
          isEligible={eligibilityResult.isEligible}
          reason={eligibilityResult.reason}
          requirements={eligibilityResult.requirements}
        />
      )}
    </div>
  );
};