import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar } from "lucide-react";

interface DashboardStatsProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  project: {
    start_date: string;
    end_date: string;
    event_path: string;
    event_category: string;
  };
  activities?: {
    total: number;
    completed: number;
    averageAttendance: number;
  };
}

export const DashboardStats = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
  project,
  activities,
}: DashboardStatsProps) => {
  console.log("DashboardStats props:", {
    registrationCount,
    remainingSeats,
    occupancyRate,
    project,
    activities,
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
          {project.event_path && project.event_category && (
            <p className="text-xs text-muted-foreground mt-1">
              {formatEventPath(project.event_path)} - {formatEventCategory(project.event_category)}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الأنشطة والحضور</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {activities ? `${activities.completed}/${activities.total}` : '0/0'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            متوسط الحضور: {activities?.averageAttendance || 0}%
          </p>
        </CardContent>
      </Card>
    </div>
  );
};