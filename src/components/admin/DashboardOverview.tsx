import { Card, CardContent } from "@/components/ui/card";
import { RegistrationStats } from "./dashboard/stats/RegistrationStats";
import { RatingStats } from "./dashboard/stats/RatingStats";
import { AttendanceStats } from "./dashboard/stats/AttendanceStats";
import { ReactNode } from "react";

interface DashboardOverviewProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  eventDate: string;
  eventTime: string;
  eventPath?: string;
  eventCategory?: string;
  projectId?: string;
  ActivityStatsComponent?: ReactNode;
}

export const DashboardOverview = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
  eventDate,
  eventTime,
  eventPath,
  eventCategory,
  projectId,
  ActivityStatsComponent
}: DashboardOverviewProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <RegistrationStats
            registrationCount={registrationCount}
            remainingSeats={remainingSeats}
            occupancyRate={occupancyRate}
          />
          {ActivityStatsComponent}
          <AttendanceStats
            eventDate={eventDate}
            eventTime={eventTime}
          />
          <RatingStats
            eventPath={eventPath}
            eventCategory={eventCategory}
          />
        </div>
      </CardContent>
    </Card>
  );
};