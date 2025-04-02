import { useState, useEffect } from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Users, FileText, UserCheck, GraduationCap, Calendar, 
  DollarSign, Search, Settings, UserPlus, UserMinus,
  CalendarClock, Clock, TrendingUp, TrendingDown, Minus,
  BarChart3, PieChart, CalendarDays 
} from "lucide-react";
import { EmployeesTab } from "@/components/hr/tabs/EmployeesTab";
import { AttendanceTab } from "@/components/hr/tabs/AttendanceTab";
import { TrainingTab } from "@/components/hr/tabs/TrainingTab";
import { CompensationTab } from "@/components/hr/tabs/CompensationTab";
import { ReportsTab } from "@/components/hr/tabs/ReportsTab";
import { HRSettingsTabs } from "@/components/hr/settings/HRSettingsTabs";
import { useHRStats } from "@/hooks/hr/useHRStats";
import { usePermissions } from "@/components/permissions/usePermissions";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/admin/ExportButton";
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines';
import { useEmployeeContracts } from "@/hooks/hr/useEmployeeContracts";

const HR = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: stats, isLoading: isLoadingStats } = useHRStats();
  const { hasPermission } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFrame, setTimeFrame] = useState<"day" | "week" | "month" | "quarter">("month");
  const [department, setDepartment] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().setMonth(new Date().getMonth() - 3))
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const { expiringContracts, endingProbations } = useEmployeeContracts();

  const hasHRAccess = hasPermission("hr", "view");
  const canManageEmployees = hasPermission("hr", "manage_employees");

  // Sample data for sparklines
  const attendanceTrend = [75, 78, 82, 79, 85, 88, 86];
  const turnoverTrend = [2.1, 1.9, 2.0, 2.2, 1.7, 1.5, 1.8];
  const leaveUsageTrend = [15, 18, 22, 25, 20, 19, 23];
  const avgServiceTrend = [3.2, 3.3, 3.5, 3.5, 3.6, 3.7, 3.8];

  const attendanceChange = ((attendanceTrend[attendanceTrend.length - 1] - attendanceTrend[0]) / attendanceTrend[0] * 100).toFixed(1);
  const turnoverChange = ((turnoverTrend[turnoverTrend.length - 1] - turnoverTrend[0]) / turnoverTrend[0] * 100).toFixed(1);
  const leaveUsageChange = ((leaveUsageTrend[leaveUsageTrend.length - 1] - leaveUsageTrend[0]) / leaveUsageTrend[0] * 100).toFixed(1);
  const avgServiceChange = ((avgServiceTrend[avgServiceTrend.length - 1] - avgServiceTrend[0]) / avgServiceTrend[0] * 100).toFixed(1);

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="text-green-500 ml-1 h-4 w-4" />;
    if (value < 0) return <TrendingDown className="text-red-500 ml-1 h-4 w-4" />;
    return <Minus className="text-gray-500 ml-1 h-4 w-4" />;
  };

  const getTrendColorClass = (metricType: string, value: number) => {
    if (metricType === 'attendance' || metricType === 'service') {
      return value >= 0 ? "text-green-500" : "text-red-500";
    }
    if (metricType === 'turnover') {
      return value <= 0 ? "text-green-500" : "text-red-500";
    }
    return "text-blue-500";
  };

  const handleTimeFrameChange = (value: string) => {
    setTimeFrame(value as "day" | "week" | "month" | "quarter");
  };

  const handleDepartmentChange = (value: string) => {
    setDepartment(value);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary text-right my-[13px]">نظام إدارة شؤون الموظفين</h1>
          <p className="text-muted-foreground text-right">إدارة شاملة لشؤون الموظفين والموارد البشرية</p>
        </div>

        <div className="w-full flex justify-end my-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="بحث..."
              className="pl-10 pr-4 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              dir="rtl"
            />
          </div>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
          <TabsList className="grid grid-cols-7 w-full mb-8">
            {/* ... بقية تبويبات القائمة كما هي ... */}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* بطاقات المؤشرات الرئيسية */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">معدل دوران الموظفين</CardTitle>
                  <UserMinus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{turnoverTrend[turnoverTrend.length - 1]}%</div>
                  <div className="mt-2 flex items-center text-xs">
                    <span className={getTrendColorClass('turnover', Number(turnoverChange))}>
                      {turnoverChange}% 
                    </span>
                    {getTrendIcon(Number(turnoverChange))}
                    <span className="mr-1 text-muted-foreground">مقارنة بالربع السابق</span>
                  </div>
                  <div className="mt-3 h-[40px]">
                    <Sparklines data={turnoverTrend} height={30}>
                      <SparklinesLine color="#8884d8" />
                      <SparklinesSpots />
                    </Sparklines>
                  </div>
                </CardContent>
              </Card>

              {/* ... بقية بطاقات المؤشرات ... */}
            </div>

            {/* قسم الفلاتر */}
            <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4 sm:rtl:space-x-reverse bg-muted/40 p-4 rounded-lg">
              {/* ... عناصر الفلاتر ... */}
            </div>

            {/* لوحات التحكم التفاعلية */}
            <Tabs defaultValue="attendance" className="space-y-4" dir="rtl">
              {/* ... تبويبات وأقسام اللوحات ... */}
            </Tabs>

            {/* الإشعارات الأصلية */}
            <Card>
              <CardHeader>
                <CardTitle className="text-right">الإشعارات والتنبيهات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg text-right">
                    <p className="font-medium">{stats?.expiringContracts || 0} عقود ستنتهي هذا الشهر</p>
                    <p className="text-sm text-muted-foreground">يجب مراجعة العقود والتجديد إذا لزم الأمر</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg text-right">
                    <p className="font-medium">{stats?.pendingTrainings || 0} موظفين لم يكملوا التدريب الإلزامي</p>
                    <p className="text-sm text-muted-foreground">يجب متابعة حالة التدريب للالتزام بالمتطلبات</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* بقية تبويبات المحتوى كما هي ... */}
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default HR;
