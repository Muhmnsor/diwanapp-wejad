import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, UserPlus, Percent } from "lucide-react";

interface DashboardStatsProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  project: {
    start_date: string;
    end_date: string;
    event_path?: string;
    event_category?: string;
  };
}

export const DashboardStats = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
  project
}: DashboardStatsProps) => {
  console.log("DashboardStats props:", {
    registrationCount,
    remainingSeats,
    occupancyRate,
    project
  });

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <Users className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium leading-none text-right">
                  عدد المسجلين
                </p>
                <p className="text-2xl font-bold">{registrationCount}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <UserPlus className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium leading-none text-right">
                  المقاعد المتبقية
                </p>
                <p className="text-2xl font-bold">{remainingSeats}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <Percent className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium leading-none text-right">
                  نسبة الإشغال
                </p>
                <div className="mt-2">
                  <Progress value={occupancyRate} className="h-2" />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {Math.round(occupancyRate)}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};