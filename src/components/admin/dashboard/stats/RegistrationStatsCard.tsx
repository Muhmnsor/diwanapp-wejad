import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface RegistrationStatsCardProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
}

export const RegistrationStatsCard = ({
  registrationCount,
  remainingSeats,
  occupancyRate
}: RegistrationStatsCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <CardTitle className="text-sm font-medium">
          التسجيلات
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{registrationCount}</div>
        <div className="text-xs text-muted-foreground">
          {remainingSeats} مقعد متبقي ({occupancyRate.toFixed(1)}%)
        </div>
      </CardContent>
    </Card>
  );
};