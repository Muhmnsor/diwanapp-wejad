
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHRStats } from "@/hooks/hr/useHRStats";
import { useEmployeeContracts } from "@/hooks/hr/useEmployeeContracts";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/admin/ExportButton";
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  CalendarClock, 
  Clock, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  BarChart3, 
  PieChart, 
  CalendarDays
} from "lucide-react";

export function HRDashboardOverview() {
  const [timeFrame, setTimeFrame] = useState<"day" | "week" | "month" | "quarter">("month");
  const [department, setDepartment] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().setMonth(new Date().getMonth() - 3))
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  
  const { data: hrStats, isLoading } = useHRStats();
  const { expiringContracts, endingProbations } = useEmployeeContracts();
  
  // Sample data for the sparklines - in a real implementation these would come from your data hooks
  const attendanceTrend = [75, 78, 82, 79, 85, 88, 86];
  const turnoverTrend = [2.1, 1.9, 2.0, 2.2, 1.7, 1.5, 1.8];
  const leaveUsageTrend = [15, 18, 22, 25, 20, 19, 23];
  const avgServiceTrend = [3.2, 3.3, 3.5, 3.5, 3.6, 3.7, 3.8];
  
  // Convert trends to percentages for visual display
  const attendanceChange = ((attendanceTrend[attendanceTrend.length - 1] - attendanceTrend[0]) / attendanceTrend[0] * 100).toFixed(1);
  const turnoverChange = ((turnoverTrend[turnoverTrend.length - 1] - turnoverTrend[0]) / turnoverTrend[0] * 100).toFixed(1);
  const leaveUsageChange = ((leaveUsageTrend[leaveUsageTrend.length - 1] - leaveUsageTrend[0]) / leaveUsageTrend[0] * 100).toFixed(1);
  const avgServiceChange = ((avgServiceTrend[avgServiceTrend.length - 1] - avgServiceTrend[0]) / avgServiceTrend[0] * 100).toFixed(1);
  
  // Determine trend direction for styling
  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="text-green-500 ml-1 h-4 w-4" />;
    if (value < 0) return <TrendingDown className="text-red-500 ml-1 h-4 w-4" />;
    return <Minus className="text-gray-500 ml-1 h-4 w-4" />;
  };
  
  // Determine color class based on the metric and its value
  const getTrendColorClass = (metricType: string, value: number) => {
    // For attendance and avg service, higher is better
    if (metricType === 'attendance' || metricType === 'service') {
      return value >= 0 ? "text-green-500" : "text-red-500";
    }
    // For turnover, lower is better
    if (metricType === 'turnover') {
      return value <= 0 ? "text-green-500" : "text-red-500";
    }
    // For leave usage, context dependent (we'll assume neutral)
    return "text-blue-500";
  };
  
  // Sample attendance distribution data
  const attendanceDistribution = {
    present: 85,
    absent: 5,
    leave: 8,
    late: 2
  };
  
  // Sample leave type distribution data
  const leaveTypeDistribution = {
    annual: 65,
    sick: 20,
    emergency: 10,
    other: 5
  };
  
  // Sample new vs departing employees data
  const employeeTurnover = {
    new: [3, 2, 4, 1, 5, 3, 2, 4, 6, 3, 2, 4],
    departing: [1, 2, 0, 3, 2, 1, 0, 2, 1, 0, 1, 2]
  };
  
  // Filter handlers
  const handleTimeFrameChange = (value: string) => {
    setTimeFrame(value as "day" | "week" | "month" | "quarter");
  };
  
  const handleDepartmentChange = (value: string) => {
    setDepartment(value);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">جاري تحميل البيانات...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* KPI Cards Section */}
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

      {/* Filters Section */}
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
            data={[]} // This would be your actual data to export
            filename="hr-dashboard-report"
          />
          <Button variant="outline" size="sm">
            <FileText className="ml-2 h-4 w-4" />
            تقرير مفصل
          </Button>
        </div>
      </div>

      {/* Interactive Dashboards */}
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
            
            <Card>
              <CardHeader>
                <CardTitle>نسب الحضور اليومية</CardTitle>
                <CardDescription>
                  معدلات الحضور خلال أيام الأسبوع
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col justify-center items-center h-[250px]">
                <BarChart3 className="h-24 w-24 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-4">الرسم البياني الشريطي سيظهر هنا</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>الموظفون الأكثر تأخرًا</CardTitle>
                <CardDescription>
                  قائمة الموظفين حسب ساعات التأخير
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="space-y-4">
                  {[1, 2, 3].map((_, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-2">
                      <div className="flex items-center">
                        <div className="ml-2 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <Users className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">موظف {index + 1}</div>
                          <div className="text-xs text-muted-foreground">قسم {index % 2 === 0 ? 'الهندسة' : 'التسويق'}</div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-amber-500">
                        {Math.floor(Math.random() * 5) + 2}:{Math.floor(Math.random() * 60).toString().padStart(2, '0')} ساعات
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
            
            <Card>
              <CardHeader>
                <CardTitle>ذروة طلبات الإجازات</CardTitle>
                <CardDescription>
                  أيام الإجازات الأكثر طلبًا (تقويم حراري)
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col justify-center items-center h-[250px]">
                <CalendarDays className="h-24 w-24 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-4">التقويم الحراري سيظهر هنا</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>الإجازات القادمة</CardTitle>
                <CardDescription>
                  الإجازات المجدولة للأسبوعين القادمين
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="space-y-4">
                  {[1, 2, 3].map((_, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-2">
                      <div className="flex items-center">
                        <div className="ml-2 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <Users className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">موظف {index + 1}</div>
                          <div className="text-xs text-muted-foreground">إجازة {index % 2 === 0 ? 'سنوية' : 'مرضية'}</div>
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold">
                          {new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toLocaleDateString('ar-SA')}
                        </div>
                        <div className="text-xs text-muted-foreground text-left">
                          {Math.floor(Math.random() * 5) + 1} أيام
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
            
            <Card>
              <CardHeader>
                <CardTitle>فترات التجربة المنتهية قريبًا</CardTitle>
                <CardDescription>
                  الموظفون الذين ستنتهي فترة تجربتهم قريبًا
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="space-y-4">
                  {endingProbations?.slice(0, 3).map((probation, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-2">
                      <div className="flex items-center">
                        <div className="ml-2 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <UserPlus className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{probation.employees?.full_name || `موظف ${index + 1}`}</div>
                          <div className="text-xs text-muted-foreground">{probation.employees?.position || 'منصب عام'}</div>
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold text-blue-500">
                          {new Date(probation.probation_end_date).toLocaleDateString('ar-SA')}
                        </div>
                        <div className="text-xs text-muted-foreground text-left">
                          {Math.floor((new Date(probation.probation_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} يوم
                        </div>
                      </div>
                    </div>
                  ))}
                  {endingProbations?.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">لا توجد فترات تجربة منتهية قريبًا</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
