
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Users,
  UserPlus,
  Calendar,
  CalendarCheck,
  Award,
  Clock,
  FileText,
  BookOpen
} from "lucide-react";
import { useHRStats } from "@/hooks/hr/useHRStats";
import { Sparklines, SparklinesLine, SparklinesSpots } from "react-sparklines";

export function HRDashboardOverview() {
  const { data: stats, isLoading, error } = useHRStats();
  const [timeFilter, setTimeFilter] = useState("today");
  
  // Sample sparkline data (would come from real data in production)
  const attendanceData = [5, 10, 5, 20, 8, 15, 5, 10, 12, 10, 5, 10];
  const employeesData = [12, 10, 11, 10, 9, 11, 12, 15, 14, 13, 15, 17];
  const leavesData = [2, 3, 5, 1, 2, 4, 3, 2, 1, 3, 2, 1];
  const trainingsData = [8, 9, 7, 8, 10, 12, 14, 12, 10, 9, 8, 10];
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-muted-foreground">جاري تحميل البيانات...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-red-500">حدث خطأ أثناء تحميل البيانات.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">نظرة عامة على الموارد البشرية</h2>
        <Tabs value={timeFilter} onValueChange={setTimeFilter} className="w-auto">
          <TabsList>
            <TabsTrigger value="today">اليوم</TabsTrigger>
            <TabsTrigger value="week">الأسبوع</TabsTrigger>
            <TabsTrigger value="month">الشهر</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-right flex items-center justify-between">
              <span>الموظفين</span>
              <Users className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              <div className="text-2xl font-bold">{stats?.totalEmployees || 0}</div>
              <div className="text-xs text-muted-foreground flex items-center">
                <span className="text-green-500">+{stats?.newEmployees || 0}</span>
                <span className="mr-1">هذا الشهر</span>
              </div>
              <div className="h-[40px] mt-2">
                <Sparklines data={employeesData} margin={5}>
                  <SparklinesLine color="#6E59A5" />
                  <SparklinesSpots size={2} style={{ fill: "#6E59A5" }} />
                </Sparklines>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-right flex items-center justify-between">
              <span>الحضور</span>
              <CalendarCheck className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              <div className="text-2xl font-bold">{stats?.presentToday || 0}</div>
              <div className="text-xs text-muted-foreground flex items-center">
                <span className={stats?.attendanceRate && stats.attendanceRate > 80 ? "text-green-500" : "text-amber-500"}>
                  {stats?.attendanceRate || 0}%
                </span>
                <span className="mr-1">نسبة الحضور</span>
              </div>
              <div className="h-[40px] mt-2">
                <Sparklines data={attendanceData} margin={5}>
                  <SparklinesLine color="#6E59A5" />
                  <SparklinesSpots size={2} style={{ fill: "#6E59A5" }} />
                </Sparklines>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-right flex items-center justify-between">
              <span>الإجازات</span>
              <Calendar className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              <div className="text-2xl font-bold">{stats?.activeLeaves || 0}</div>
              <div className="text-xs text-muted-foreground flex items-center">
                <span className="text-amber-500">+{stats?.upcomingLeaves || 0}</span>
                <span className="mr-1">في الأسبوع القادم</span>
              </div>
              <div className="h-[40px] mt-2">
                <Sparklines data={leavesData} margin={5}>
                  <SparklinesLine color="#6E59A5" />
                  <SparklinesSpots size={2} style={{ fill: "#6E59A5" }} />
                </Sparklines>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-right flex items-center justify-between">
              <span>التدريب</span>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              <div className="text-2xl font-bold">{stats?.pendingTrainings || 0}</div>
              <div className="text-xs text-muted-foreground flex items-center">
                <span className="text-red-500">{stats?.expiringContracts || 0}</span>
                <span className="mr-1">عقد ينتهي قريباً</span>
              </div>
              <div className="h-[40px] mt-2">
                <Sparklines data={trainingsData} margin={5}>
                  <SparklinesLine color="#6E59A5" />
                  <SparklinesSpots size={2} style={{ fill: "#6E59A5" }} />
                </Sparklines>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white">
          <CardHeader>
            <CardTitle className="text-right">إحصائيات الحضور</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              سيتم عرض رسم بياني مفصل للحضور هنا
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-right">العقود التي ستنتهي قريباً</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.expiringContracts && stats.expiringContracts > 0 ? (
              <div className="space-y-4">
                <p className="text-amber-500 font-medium text-lg text-center">
                  {stats.expiringContracts} عقد ينتهي خلال الشهر القادم
                </p>
                <Button variant="outline" className="w-full">عرض التفاصيل</Button>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                لا توجد عقود تنتهي في الشهر القادم
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
