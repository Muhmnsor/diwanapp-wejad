import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, TrendingDown, Activity, Star } from "lucide-react";

interface DashboardStatsProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  eventDate: string;
  eventTime: string;
  eventPath?: string;
  eventCategory?: string;
  projectActivities?: {
    id: string;
    title: string;
    attendanceRate?: number;
    rating?: number;
  }[];
  totalActivities?: number;
  completedActivities?: number;
  averageAttendanceRate?: number;
}

export const DashboardStats = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
  eventPath,
  eventCategory,
  projectActivities = [],
  totalActivities = 0,
  completedActivities = 0,
  averageAttendanceRate = 0,
}: DashboardStatsProps) => {
  console.log("DashboardStats props:", {
    registrationCount,
    remainingSeats,
    occupancyRate,
    eventPath,
    eventCategory,
    projectActivities,
    totalActivities,
    completedActivities,
    averageAttendanceRate,
  });

  const formatEventPath = (path?: string) => {
    if (!path) return '';
    const pathMap: Record<string, string> = {
      'environment': 'البيئة',
      'community': 'المجتمع',
      'content': 'المحتوى'
    };
    return pathMap[path] || path;
  };

  const formatEventCategory = (category?: string) => {
    if (!category) return '';
    const categoryMap: Record<string, string> = {
      'social': 'اجتماعي',
      'entertainment': 'ترفيهي',
      'service': 'خدمي',
      'educational': 'تعليمي',
      'consulting': 'استشاري',
      'interest': 'اهتمام',
      'specialization': 'تخصص',
      'spiritual': 'روحي',
      'cultural': 'ثقافي',
      'behavioral': 'سلوكي',
      'skill': 'مهاري',
      'health': 'صحي',
      'diverse': 'متنوع'
    };
    return categoryMap[category] || category;
  };

  // Find activities with highest and lowest attendance rates
  const sortedByAttendance = [...projectActivities].sort((a, b) => 
    (b.attendanceRate || 0) - (a.attendanceRate || 0)
  );
  const highestAttendance = sortedByAttendance[0];
  const lowestAttendance = sortedByAttendance[sortedByAttendance.length - 1];

  // Find activities with highest and lowest ratings
  const sortedByRating = [...projectActivities].sort((a, b) => 
    (b.rating || 0) - (a.rating || 0)
  );
  const highestRated = sortedByRating[0];
  const lowestRated = sortedByRating[sortedByRating.length - 1];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي المسجلين</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{registrationCount}</div>
          <p className="text-xs text-muted-foreground">
            متبقي {remainingSeats} مقعد
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">نسبة الإشغال</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{occupancyRate?.toFixed(1) || 0}%</div>
          {eventPath && eventCategory && (
            <p className="text-xs text-muted-foreground mt-1">
              {formatEventPath(eventPath)} - {formatEventCategory(eventCategory)}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الأنشطة المتبقية</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalActivities - completedActivities} من {totalActivities}
          </div>
          <p className="text-xs text-muted-foreground">
            متوسط نسبة الحضور {averageAttendanceRate?.toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">أعلى نسبة حضور</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">{highestAttendance?.title || '-'}</div>
          <p className="text-xs text-muted-foreground">
            {highestAttendance?.attendanceRate?.toFixed(1) || 0}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">أقل نسبة حضور</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">{lowestAttendance?.title || '-'}</div>
          <p className="text-xs text-muted-foreground">
            {lowestAttendance?.attendanceRate?.toFixed(1) || 0}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">أعلى تقييم نشاط</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">{highestRated?.title || '-'}</div>
          <p className="text-xs text-muted-foreground">
            {highestRated?.rating?.toFixed(1) || 0} من 5
          </p>
        </CardContent>
      </Card>
    </div>
  );
};