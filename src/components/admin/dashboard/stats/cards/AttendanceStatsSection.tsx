
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { formatDate } from "@/utils/formatters";
import { formatTime12Hour } from "@/utils/dateTimeUtils";

interface AttendanceStatsSectionProps {
  highestAttendance?: {
    eventId: string;
    title: string;
    date: string;
    count: number;
    totalRegistrations: number;
    attendanceRate: number;
  } | null;
  lowestAttendance?: {
    eventId: string;
    title: string;
    date: string;
    count: number;
    totalRegistrations: number;
    attendanceRate: number;
  } | null;
}

export const AttendanceStatsSection = ({
  highestAttendance,
  lowestAttendance
}: AttendanceStatsSectionProps) => {
  const formatEventDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: ar });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            أعلى نسبة حضور
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          {highestAttendance ? (
            <>
              <div className="text-xl font-bold mb-1">{highestAttendance.title}</div>
              <div className="flex justify-between items-center">
                <div className="text-sm">{formatEventDate(highestAttendance.date)}</div>
                <div className="text-sm font-semibold text-green-600">
                  {highestAttendance.attendanceRate.toFixed(0)}%
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {highestAttendance.count} من أصل {highestAttendance.totalRegistrations} مسجل
              </p>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              لا توجد بيانات حضور حالياً
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            أدنى نسبة حضور
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          {lowestAttendance ? (
            <>
              <div className="text-xl font-bold mb-1">{lowestAttendance.title}</div>
              <div className="flex justify-between items-center">
                <div className="text-sm">{formatEventDate(lowestAttendance.date)}</div>
                <div className="text-sm font-semibold text-red-600">
                  {lowestAttendance.attendanceRate.toFixed(0)}%
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {lowestAttendance.count} من أصل {lowestAttendance.totalRegistrations} مسجل
              </p>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              لا توجد بيانات حضور حالياً
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
