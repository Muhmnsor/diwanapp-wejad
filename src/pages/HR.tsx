import { useState } from "react";
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

  // Sample distribution data
  const attendanceDistribution = {
    present: 85,
    absent: 5,
    leave: 8,
    late: 2
  };
  
  const leaveTypeDistribution = {
    annual: 65,
    sick: 20,
    emergency: 10,
    other: 5
  };

  // Calculate trends
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

  if (!hasHRAccess) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <TopHeader />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">غير مصرح بالوصول</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p>ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

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
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>نظرة عامة</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              <span>الموظفين</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>الحضور والإجازات</span>
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span>التدريب والتطوير</span>
            </TabsTrigger>
            <TabsTrigger value="compensation" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>التعويضات والمزايا</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>التقارير</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>الإعدادات</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* بطاقات المؤشرات الرئيسية */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Employee Turnover Rate */}
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

              {/* Average Service Duration */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">متوسط مدة الخدمة</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avgServiceTrend[avgServiceTrend.length - 1]} سنوات</div>
                  <div className="mt-2 flex items-center text-xs">
                    <span className={getTrendColorClass('service', Number(avgServiceChange))}>
                      {avgServiceChange}% 
                    </span>
                    {getTrendIcon(Number(avgServiceChange))}
                    <span className="mr-1 text-muted-foreground">مقارنة بالعام السابق</span>
                  </div>
                  <div className="mt-3 h-[40px]">
                    <Sparklines data={avgServiceTrend} height={30}>
                      <SparklinesLine color="#82ca9d" />
                      <SparklinesSpots />
                    </Sparklines>
                  </div>
                </CardContent>
              </Card>

              {/* Attendance Compliance Rate */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">معدل الالتزام بالحضور</CardTitle>
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{attendanceTrend[attendanceTrend.length - 1]}%</div>
                  <div className="mt-2 flex items-center text-xs">
                    <span className={getTrendColorClass('attendance', Number(attendanceChange))}>
                      {attendanceChange}% 
                    </span>
                    {getTrendIcon(Number(attendanceChange))}
                    <span className="mr-1 text-muted-foreground">مقارنة بالشهر السابق</span>
                  </div>
                  <div className="mt-3 h-[40px]">
                    <Sparklines data={attendanceTrend} height={30}>
                      <SparklinesLine color="#ffc658" />
                      <SparklinesSpots />
                    </Sparklines>
                  </div>
                </CardContent>
              </Card>

              {/* Leave Usage Rate */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">معدل استخدام الإجازات</CardTitle>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{leaveUsageTrend[leaveUsageTrend.length - 1]}%</div>
                  <div className="mt-2 flex items-center text-xs">
                    <span className={getTrendColorClass('leaves', Number(leaveUsageChange))}>
                      {leaveUsageChange}% 
                    </span>
                    {getTrendIcon(Number(leaveUsageChange))}
                    <span className="mr-1 text-muted-foreground">مقارنة بالربع السابق</span>
                  </div>
                  <div className="mt-3 h-[40px]">
                    <Sparklines data={leaveUsageTrend} height={30}>
                      <SparklinesLine color="#ff7300" />
                      <SparklinesSpots />
                    </Sparklines>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* قسم الفلاتر */}
            <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4 sm:rtl:space-x-reverse bg-muted/40 p-4 rounded-lg">
              <div className="flex flex-col sm:flex-row gap-4 rtl:space-x-reverse">
                <div className="w-full sm:w-48">
                  <Select value={timeFrame} onValueChange={handleTimeFrameChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="الفترة الزمنية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">يومي</SelectItem>
                      <SelectItem value="week">أسبوعي</SelectItem>
                      <SelectItem value="month">شهري</SelectItem>
                      <SelectItem value="quarter">ربع سنوي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:w-48">
                  <Select value={department} onValueChange={handleDepartmentChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأقسام</SelectItem>
                      <SelectItem value="engineering">الهندسة</SelectItem>
                      <SelectItem value="marketing">التسويق</SelectItem>
                      <SelectItem value="hr">الموارد البشرية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 rtl:space-x-reverse">
                <div className="w-full sm:w-40">
                  <DatePicker 
                    date={startDate} 
                    setDate={setStartDate} 
                    placeholder="من تاريخ"
                    locale="ar"
                  />
                </div>
                <div className="w-full sm:w-40">
                  <DatePicker 
                    date={endDate} 
                    setDate={setEndDate} 
                    placeholder="إلى تاريخ" 
                    locale="ar"
                  />
                </div>
              </div>
              <div className="flex space-x-2 rtl:space-x-reverse">
                <ExportButton 
                  data={[]}
                  filename="hr-dashboard-report"
                />
                <Button variant="outline" size="sm">
                  <FileText className="ml-2 h-4 w-4" />
                  تقرير مفصل
                </Button>
              </div>
            </div>

            {/* لوحات التحكم التفاعلية */}
            <Tabs defaultValue="attendance" className="space-y-4" dir="rtl">
              <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                <TabsTrigger value="attendance" className="flex items-center gap-1">
                  <CalendarClock className="h-4 w-4" />
                  الحضور والغياب
                </TabsTrigger>
                <TabsTrigger value="leaves" className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  الإجازات
                </TabsTrigger>
                <TabsTrigger value="contracts" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  العقود والتوظيف
                </TabsTrigger>
              </TabsList>
              
              {/* Attendance Dashboard */}
              <TabsContent value="attendance" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>إحصائيات الحضور</CardTitle>
                      <CardDescription>
                        توزيع حالات الموظفين لهذا الشهر
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-around text-center">
                        <div>
                          <div className="text-2xl font-bold text-green-500">{attendanceDistribution.present}%</div>
                          <div className="text-sm text-muted-foreground">حاضر</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-red-500">{attendanceDistribution.absent}%</div>
                          <div className="text-sm text-muted-foreground">غائب</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-500">{attendanceDistribution.leave}%</div>
                          <div className="text-sm text-muted-foreground">إجازة</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-amber-500">{attendanceDistribution.late}%</div>
                          <div className="text-sm text-muted-foreground">متأخر</div>
                        </div>
                      </div>
                      <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">العرض البياني سيظهر هنا</p>
                        <PieChart className="h-24 w-24 mx-auto mt-2 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* ... بقية بطاقات لوحة الحضور ... */}
                </div>
              </TabsContent>
              
              {/* Leaves Dashboard */}
              <TabsContent value="leaves" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>توزيع الإجازات حسب النوع</CardTitle>
                      <CardDescription>
                        نسب استخدام الإجازات بأنواعها
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-around text-center">
                        <div>
                          <div className="text-2xl font-bold text-indigo-500">{leaveTypeDistribution.annual}%</div>
                          <div className="text-sm text-muted-foreground">سنوية</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-teal-500">{leaveTypeDistribution.sick}%</div>
                          <div className="text-sm text-muted-foreground">مرضية</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-orange-500">{leaveTypeDistribution.emergency}%</div>
                          <div className="text-sm text-muted-foreground">طارئة</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-500">{leaveTypeDistribution.other}%</div>
                          <div className="text-sm text-muted-foreground">أخرى</div>
                        </div>
                      </div>
                      <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">العرض البياني سيظهر هنا</p>
                        <PieChart className="h-24 w-24 mx-auto mt-2 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* ... بقية بطاقات لوحة الإجازات ... */}
                </div>
              </TabsContent>
              
              {/* Contracts Dashboard */}
              <TabsContent value="contracts" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>حركة التوظيف</CardTitle>
                      <CardDescription>
                        الموظفون الجدد مقابل المغادرين
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col justify-center items-center h-[250px]">
                      <BarChart3 className="h-24 w-24 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-4">الرسم البياني المقارن سيظهر هنا</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>العقود المنتهية قريبًا</CardTitle>
                      <CardDescription>
                        العقود التي ستنتهي خلال 60 يومًا
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-2">
                      <div className="space-y-4">
                        {expiringContracts?.slice(0, 3).map((contract, index) => (
                          <div key={index} className="flex justify-between items-center border-b pb-2">
                            <div className="flex items-center">
                              <div className="ml-2 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                <Users className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-medium">{contract.employees?.full_name || `موظف ${index + 1}`}</div>
                                <div className="text-xs text-muted-foreground">{contract.employees?.department || 'قسم عام'}</div>
                              </div>
                            </div>
                            <div className="text-sm">
                              <div className="font-semibold text-amber-500">
                                {new Date(contract.end_date).toLocaleDateString('ar-SA')}
                              </div>
                              <div className="text-xs text-muted-foreground text-left">
                                {Math.floor((new Date(contract.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} يوم
                              </div>
                            </div>
                          </div>
                        ))}
                        {expiringContracts?.length === 0 && (
                          <p className="text-center text-muted-foreground py-4">لا توجد عقود منتهية قريبًا</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* ... بقية بطاقات لوحة العقود ... */}
                </div>
              </TabsContent>
            </Tabs>

            {/* البطاقات الأصلية */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-right text-lg">إجمالي الموظفين</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{isLoadingStats ? "..." : stats?.totalEmployees || 0}</div>
                  <p className="text-sm text-muted-foreground">
                    {stats?.newEmployees ? `${stats.newEmployees} موظفين جدد هذا الشهر` : "لا يوجد موظفين جدد"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-right text-lg">الحضور اليوم</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{isLoadingStats ? "..." : stats?.presentToday || 0}</div>
                  <p className="text-sm text-muted-foreground">
                    {isLoadingStats ? "..." : `${stats?.attendanceRate || 0}% نسبة الحضور`}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-right text-lg">الإجازات النشطة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{isLoadingStats ? "..." : stats?.activeLeaves || 0}</div>
                  <p className="text-sm text-muted-foreground">
                    {isLoadingStats ? "..." : `${stats?.upcomingLeaves || 0} إجازات متوقعة الأسبوع القادم`}
                  </p>
                </CardContent>
              </Card>
            </div>

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

          <TabsContent value="employees">
            <EmployeesTab searchTerm={searchTerm} />
          </TabsContent>

          <TabsContent value="attendance">
            <AttendanceTab />
          </TabsContent>

          <TabsContent value="training">
            <TrainingTab />
          </TabsContent>

          <TabsContent value="compensation">
            <CompensationTab />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>
          
          <TabsContent value="settings">
            <HRSettingsTabs />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default HR;
