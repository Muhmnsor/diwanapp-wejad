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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">المسجلين</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{registrationCount}</div>
        <p className="text-xs text-muted-foreground mt-1">
          المقاعد المتبقية: {remainingSeats} | نسبة الإشغال: {occupancyRate.toFixed(1)}%
        </p>
      </CardContent>
    </Card>
  );
};