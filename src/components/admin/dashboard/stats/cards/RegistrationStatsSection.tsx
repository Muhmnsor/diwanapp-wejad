import { RegistrationStatsCard } from "../RegistrationStatsCard";

interface RegistrationStatsSectionProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
}

export const RegistrationStatsSection = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
}: RegistrationStatsSectionProps) => {
  return (
    <RegistrationStatsCard
      registrationCount={registrationCount}
      remainingSeats={remainingSeats}
      occupancyRate={occupancyRate}
    />
  );
};