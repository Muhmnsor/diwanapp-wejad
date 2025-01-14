import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, TrendingUp, TrendingDown, DollarSign, Percent, Star, UserCheck, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { DashboardData } from "@/types/dashboard";

interface DashboardStatsProps {
  data: DashboardData;
}

export const DashboardStats = ({ data }: DashboardStatsProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">المرحلة الحالية</CardTitle>
          {getStatusIcon('in_progress')}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">المرحلة الثالثة</div>
          <div className="text-xs text-muted-foreground mt-1">
            تطوير واجهة المستخدم
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">المراحل المكتملة</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">2 من 6</div>
          <div className="text-xs text-muted-foreground mt-1">
            نسبة الإكمال: 33%
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">المهام المنجزة</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.completedTasks || 8}</div>
          <div className="text-xs text-muted-foreground mt-1">
            من أصل {data.totalTasks || 24} مهمة
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">المحافظ النشطة</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.activePortfolios || 3}</div>
          <div className="text-xs text-muted-foreground mt-1">
            تمت المزامنة: {data.syncedPortfolios || 2}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">حالة المرحلة الثانية</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">تم إنجاز 80%</div>
          <div className="text-xs text-muted-foreground mt-1">
            متبقي: تحسين الفهرسة والعلاقات
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">حالة المرحلة الثالثة</CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">قيد التنفيذ</div>
          <div className="text-xs text-muted-foreground mt-1">
            تم إنجاز: تطوير الواجهات الأساسية
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">المراحل القادمة</CardTitle>
          <AlertCircle className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">المرحلة الرابعة</div>
          <div className="text-xs text-muted-foreground mt-1">
            تطوير نظام المزامنة الجديد
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">نسبة الإنجاز الكلية</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">45%</div>
          <div className="text-xs text-muted-foreground mt-1">
            من إجمالي المشروع
          </div>
        </CardContent>
      </Card>
    </div>
  );
};