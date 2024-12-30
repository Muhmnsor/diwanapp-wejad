import { RegistrationStatsCard } from "./RegistrationStatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EventStatsContentProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  project: {
    id: string;
    event_path: string;
    event_category: string;
  };
}

export const EventStatsContent = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
  project
}: EventStatsContentProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <RegistrationStatsCard
        registrationCount={registrationCount}
        remainingSeats={remainingSeats}
        occupancyRate={occupancyRate}
      />
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            نوع الفعالية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{project.event_path}</div>
          <p className="text-xs text-muted-foreground">
            {project.event_category}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};