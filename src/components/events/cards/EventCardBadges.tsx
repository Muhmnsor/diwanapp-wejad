import { EventTypeCardBadge } from "../badges/card/EventTypeCardBadge";
import { PriceCardBadge } from "../badges/card/PriceCardBadge";
import { BeneficiaryCardBadge } from "../badges/card/BeneficiaryCardBadge";
import { CertificateCardBadge } from "../badges/card/CertificateCardBadge";
import { HoursCardBadge } from "../badges/card/HoursCardBadge";

interface EventCardBadgesProps {
  eventType: "online" | "in-person";
  price: number | null;
  beneficiaryType: string;
  certificateType?: string;
  eventHours?: number;
}

export const EventCardBadges = ({
  eventType,
  price,
  beneficiaryType,
  certificateType,
  eventHours
}: EventCardBadgesProps) => {
  console.log('EventCardBadges received:', {
    eventType,
    price,
    beneficiaryType,
    certificateType,
    eventHours
  });

  // تحقق من وجود نوع الشهادة أولاً
  const shouldShowCertificate = certificateType && certificateType !== 'none';
  // تحقق من وجود الساعات وأنها أكبر من صفر فقط إذا كان هناك شهادة
  const shouldShowHours = shouldShowCertificate && eventHours && eventHours > 0;

  return (
    <div className="flex flex-wrap gap-2">
      <EventTypeCardBadge eventType={eventType} />
      <PriceCardBadge price={price} />
      <BeneficiaryCardBadge beneficiaryType={beneficiaryType} />
      
      {shouldShowCertificate && (
        <CertificateCardBadge certificateType={certificateType} />
      )}
      
      {shouldShowHours && (
        <HoursCardBadge hours={eventHours} />
      )}
    </div>
  );
};