
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarX, Percent } from "lucide-react";

interface RegistrationStatsSectionProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
}

export const RegistrationStatsSection = ({
  registrationCount,
  remainingSeats,
  occupancyRate
}: RegistrationStatsSectionProps) => {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            المسجلون
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{registrationCount}</div>
          <p className="text-xs text-muted-foreground mt-2">
            عدد المسجلين حتى الآن
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            المقاعد المتبقية
          </CardTitle>
          <CalendarX className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{remainingSeats}</div>
          <p className="text-xs text-muted-foreground mt-2">
            عدد المقاعد المتاحة للتسجيل
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            نسبة الإشغال
          </CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {occupancyRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            نسبة المقاعد المشغولة من الإجمالي
          </p>
        </CardContent>
      </Card>
    </>
  );
};
