
import { Card, CardContent } from "@/components/ui/card";
import { useHRStats } from "@/hooks/hr/useHRStats";
import { Sparkline, SparklineSpot } from "@/components/ui/sparkline";
import { 
  Users, 
  CalendarClock, 
  FileBarChart, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Briefcase, 
  GraduationCap,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Clock8
} from "lucide-react";
import { cn } from "@/lib/utils";

const HROverview = () => {
  const { data: stats, isLoading: isLoadingStats } = useHRStats();

  // Sample sparkline data (this would ideally come from the API with historical data)
  const attendanceTrend = [68, 72, 75, 78, 75, 82, 85];
  const employeeTrend = [120, 125, 128, 132, 135, 138, 142];
  const leaveTrend = [12, 15, 8, 10, 7, 14, 16];
  const turnoverTrend = [4, 3, 2, 5, 2, 3, 1];

  // Helper function to render trend indicator
  const renderTrendIndicator = (change: number) => {
    if (change > 0) {
      return (
        <div className="flex items-center text-green-600">
          <TrendingUp className="h-3 w-3 mr-1" />
          <span className="text-xs">+{change}%</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center text-red-600">
          <TrendingDown className="h-3 w-3 mr-1" />
          <span className="text-xs">{change}%</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-gray-500">
          <Minus className="h-3 w-3 mr-1" />
          <span className="text-xs">0%</span>
        </div>
      );
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">نظرة عامة على شؤون الموظفين</h1>
        <p className="text-muted-foreground">إحصائيات ومؤشرات أداء إدارة شؤون الموظفين</p>
      </div>

      {/* Employee Stats Section */}
      <div>
        <h2 className="text-lg font-semibold mb-3">إحصائيات الموظفين</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Employees Card */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 flex items-center space-x-4 space-x-reverse border-b">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1 rtl:text-right">
                  <p className="text-sm text-muted-foreground">الموظفين</p>
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">
                      {isLoadingStats ? "..." : stats?.totalEmployees || 0}
                    </h3>
                    {!isLoadingStats && renderTrendIndicator(5)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isLoadingStats ? "..." : stats?.newEmployees || 0} موظف جديد هذا الشهر
                  </p>
                </div>
              </div>
              <div className="h-10 px-1 bg-gray-50">
                <Sparkline data={employeeTrend} color="#4375fb" height={24}>
                  <SparklineSpot spotColors={{ endSpot: "#4375fb" }} />
                </Sparkline>
              </div>
            </CardContent>
          </Card>
          
          {/* Employee Turnover Card */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 flex items-center space-x-4 space-x-reverse border-b">
                <div className="p-2 bg-amber-100 rounded-full">
                  <RefreshCw className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1 rtl:text-right">
                  <p className="text-sm text-muted-foreground">معدل دوران الموظفين</p>
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">4.2%</h3>
                    {renderTrendIndicator(-1.5)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    انخفاض بنسبة 1.5% عن الربع السابق
                  </p>
                </div>
              </div>
              <div className="h-10 px-1 bg-gray-50">
                <Sparkline data={turnoverTrend} color="#f59e0b" height={24}>
                  <SparklineSpot spotColors={{ endSpot: "#f59e0b" }} />
                </Sparkline>
              </div>
            </CardContent>
          </Card>
          
          {/* Average Tenure Card */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 flex items-center space-x-4 space-x-reverse border-b">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Clock8 className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1 rtl:text-right">
                  <p className="text-sm text-muted-foreground">متوسط مدة الخدمة</p>
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">3.2</h3>
                    {renderTrendIndicator(0.4)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    سنوات (زيادة 0.4 عن العام السابق)
                  </p>
                </div>
              </div>
              <div className="h-10 px-1 bg-gray-50">
                <Sparkline data={[2.6, 2.7, 2.8, 2.9, 3.0, 3.1, 3.2]} color="#8b5cf6" height={24}>
                  <SparklineSpot spotColors={{ endSpot: "#8b5cf6" }} />
                </Sparkline>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Attendance and Leave Stats Section */}
      <div>
        <h2 className="text-lg font-semibold mb-3">الحضور والإجازات</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Attendance Today Card */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 flex items-center space-x-4 space-x-reverse border-b">
                <div className="p-2 bg-green-100 rounded-full">
                  <CalendarClock className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1 rtl:text-right">
                  <p className="text-sm text-muted-foreground">الحضور اليوم</p>
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">
                      {isLoadingStats ? "..." : stats?.presentToday || 0}
                    </h3>
                    {!isLoadingStats && renderTrendIndicator(3)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    نسبة الحضور: {isLoadingStats ? "..." : `${stats?.attendanceRate || 0}%`}
                  </p>
                </div>
              </div>
              <div className="h-10 px-1 bg-gray-50">
                <Sparkline data={attendanceTrend} color="#10b981" height={24}>
                  <SparklineSpot spotColors={{ endSpot: "#10b981" }} />
                </Sparkline>
              </div>
            </CardContent>
          </Card>
          
          {/* Active Leaves Card */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 flex items-center space-x-4 space-x-reverse border-b">
                <div className="p-2 bg-amber-100 rounded-full">
                  <Calendar className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1 rtl:text-right">
                  <p className="text-sm text-muted-foreground">الإجازات النشطة</p>
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">
                      {isLoadingStats ? "..." : stats?.activeLeaves || 0}
                    </h3>
                    {!isLoadingStats && renderTrendIndicator(-2)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isLoadingStats ? "..." : stats?.upcomingLeaves || 0} إجازة في الأسبوع القادم
                  </p>
                </div>
              </div>
              <div className="h-10 px-1 bg-gray-50">
                <Sparkline data={leaveTrend} color="#f59e0b" height={24}>
                  <SparklineSpot spotColors={{ endSpot: "#f59e0b" }} />
                </Sparkline>
              </div>
            </CardContent>
          </Card>
          
          {/* Leave Utilization Card */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 flex items-center space-x-4 space-x-reverse border-b">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1 rtl:text-right">
                  <p className="text-sm text-muted-foreground">استخدام الإجازات السنوية</p>
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">68%</h3>
                    {renderTrendIndicator(5)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    من إجمالي أيام الإجازات المستحقة
                  </p>
                </div>
              </div>
              <div className="h-10 px-1 bg-gray-50">
                <Sparkline data={[55, 58, 62, 60, 65, 67, 68]} color="#3b82f6" height={24}>
                  <SparklineSpot spotColors={{ endSpot: "#3b82f6" }} />
                </Sparkline>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contracts and Training Section */}
      <div>
        <h2 className="text-lg font-semibold mb-3">العقود والتدريب</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Expiring Contracts Card */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 flex items-center space-x-4 space-x-reverse">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Briefcase className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1 rtl:text-right">
                  <p className="text-sm text-muted-foreground">العقود المنتهية قريباً</p>
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">
                      {isLoadingStats ? "..." : stats?.expiringContracts || 0}
                    </h3>
                    <div className={cn(
                      "px-2 py-1 rounded-full text-xs",
                      stats?.expiringContracts > 5 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                    )}>
                      {stats?.expiringContracts > 5 ? "تحتاج انتباه" : "ضمن المعدل"}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    خلال الشهر القادم
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Training Card */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 flex items-center space-x-4 space-x-reverse">
                <div className="p-2 bg-cyan-100 rounded-full">
                  <GraduationCap className="h-6 w-6 text-cyan-600" />
                </div>
                <div className="flex-1 rtl:text-right">
                  <p className="text-sm text-muted-foreground">التدريبات الحالية</p>
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">
                      {isLoadingStats ? "..." : stats?.pendingTrainings || 0}
                    </h3>
                    {renderTrendIndicator(10)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    برامج تدريبية قيد التنفيذ
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Urgent Tasks Card */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 flex items-center space-x-4 space-x-reverse">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1 rtl:text-right">
                  <p className="text-sm text-muted-foreground">المهام العاجلة</p>
                  <h3 className="text-2xl font-bold">3</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    مهام تحتاج إلى متابعة فورية
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HROverview;
