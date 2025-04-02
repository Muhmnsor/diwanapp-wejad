
import React, { useState } from "react";
import { useHRStats } from "@/hooks/hr/useHRStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  UserPlus, 
  CalendarClock, 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  ClipboardCheck, 
  Clock, 
  UserCheck, 
  AlertTriangle,
  FileText,
  Download,
  Printer
} from "lucide-react";
import { Sparkline, SparklineSpot } from "@/components/ui/sparkline";
import { useEmployeeReport } from "@/hooks/hr/useEmployeeReport";
import { useAttendanceReport } from "@/hooks/hr/useAttendanceReport";
import { useLeaveReport } from "@/hooks/hr/useLeaveReport";
import { useEmployeeContracts } from "@/hooks/hr/useEmployeeContracts";
import { format, subMonths } from "date-fns";
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line 
} from "recharts";

const COLORS = ['#4ade80', '#facc15', '#f87171', '#60a5fa', '#c084fc', '#f472b6'];

export function HRDashboardOverview() {
  const [dateRange, setDateRange] = useState({
    start: subMonths(new Date(), 3),
    end: new Date()
  });
  const [department, setDepartment] = useState("all");
  const [timespan, setTimespan] = useState("month");
  
  // Fetch HR statistics and reports
  const { data: hrStats, isLoading: statsLoading } = useHRStats();
  const { data: employeeReport } = useEmployeeReport(subMonths(new Date(), 3), new Date());
  const { data: attendanceReport } = useAttendanceReport(subMonths(new Date(), 3), new Date());
  const { data: leaveReport } = useLeaveReport(subMonths(new Date(), 3), new Date());
  const { expiringContracts, endingProbations } = useEmployeeContracts();

  // Sample data for sparklines
  const generateSparklineData = (base, variance, count = 10) => {
    return Array.from({ length: count }, (_, i) => 
      base + Math.random() * variance - variance/2
    );
  };

  // Sample data for trends
  const attendanceTrend = generateSparklineData(90, 10);
  const turnoverTrend = generateSparklineData(5, 3);
  const avgServiceTrend = generateSparklineData(24, 6);
  const leaveUsageTrend = generateSparklineData(65, 15);

  // Calculate KPI values
  const turnoverRate = 4.8; // Sample value in percentage
  const avgServiceDuration = 26; // Sample value in months
  const attendanceCompliance = 94.2; // Sample value in percentage
  const leaveUsageRate = 68.5; // Sample value in percentage

  // Compare with previous periods (sample values)
  const turnoverChange = -0.7; // Percentage points
  const avgServiceChange = 2.1; // Months
  const attendanceChange = 1.3; // Percentage points
  const leaveUsageChange = 5.2; // Percentage points

  // Data for attendance distribution chart
  const attendanceDistributionData = [
    { name: 'حاضر', value: attendanceReport?.stats?.presentCount || 85 },
    { name: 'متأخر', value: attendanceReport?.stats?.lateCount || 7 },
    { name: 'غائب', value: attendanceReport?.stats?.absentCount || 3 },
    { name: 'إجازة', value: attendanceReport?.stats?.leaveCount || 5 }
  ];

  // Data for attendance by day chart
  const attendanceByDayData = [
    { day: 'الأحد', present: 19, late: 1, absent: 0 },
    { day: 'الإثنين', present: 18, late: 2, absent: 0 },
    { day: 'الثلاثاء', present: 17, late: 2, absent: 1 },
    { day: 'الأربعاء', present: 16, late: 3, absent: 1 },
    { day: 'الخميس', present: 15, late: 3, absent: 2 }
  ];

  // Data for leave distribution chart
  const leaveDistributionData = [
    { name: 'سنوية', value: leaveReport?.leaveTypeStats?.[0]?.days || 24 },
    { name: 'مرضية', value: leaveReport?.leaveTypeStats?.[1]?.days || 12 },
    { name: 'طارئة', value: leaveReport?.leaveTypeStats?.[2]?.days || 5 },
    { name: 'أخرى', value: leaveReport?.leaveTypeStats?.[3]?.days || 3 }
  ];
  
  // Data for employee trends chart
  const employeeTrendsData = [
    { month: 'يناير', joined: 2, left: 1 },
    { month: 'فبراير', joined: 3, left: 0 },
    { month: 'مارس', joined: 1, left: 1 },
    { month: 'أبريل', joined: 2, left: 1 },
    { month: 'مايو', joined: 3, left: 2 },
    { month: 'يونيو', joined: 2, left: 0 }
  ];

  // Handle export functions
  const handleExportPDF = () => {
    console.log("Exporting dashboard as PDF");
    // Implementation would go here
  };

  const handleExportExcel = () => {
    console.log("Exporting data to Excel");
    // Implementation would go here
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:m-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <h2 className="text-2xl font-bold">نظرة عامة على الموارد البشرية</h2>
        
        <div className="flex flex-wrap gap-2">
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="القسم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الأقسام</SelectItem>
              <SelectItem value="engineering">الهندسة</SelectItem>
              <SelectItem value="marketing">التسويق</SelectItem>
              <SelectItem value="hr">الموارد البشرية</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timespan} onValueChange={setTimespan}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="الفترة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">أسبوع</SelectItem>
              <SelectItem value="month">شهر</SelectItem>
              <SelectItem value="quarter">ربع سنة</SelectItem>
              <SelectItem value="year">سنة</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex gap-2">
            <Button size="icon" variant="outline" onClick={handleExportExcel}>
              <FileText className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline" onClick={handleExportPDF}>
              <Download className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Employee Turnover Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل دوران الموظفين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{turnoverRate}%</div>
            <div className="h-10 mt-2">
              <Sparkline data={turnoverTrend}>
                <SparklineSpot />
              </Sparkline>
            </div>
            <div className="flex items-center pt-1">
              {turnoverChange < 0 ? (
                <>
                  <TrendingDown className="mr-1 h-3 w-3 text-green-500" />
                  <p className="text-xs text-green-500">
                    انخفاض {Math.abs(turnoverChange)}% عن الفترة السابقة
                  </p>
                </>
              ) : (
                <>
                  <TrendingUp className="mr-1 h-3 w-3 text-red-500" />
                  <p className="text-xs text-red-500">
                    ارتفاع {turnoverChange}% عن الفترة السابقة
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Average Service Duration */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط مدة الخدمة</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgServiceDuration} شهر</div>
            <div className="h-10 mt-2">
              <Sparkline data={avgServiceTrend}>
                <SparklineSpot />
              </Sparkline>
            </div>
            <div className="flex items-center pt-1">
              {avgServiceChange > 0 ? (
                <>
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <p className="text-xs text-green-500">
                    زيادة {avgServiceChange} شهر عن الفترة السابقة
                  </p>
                </>
              ) : (
                <>
                  <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  <p className="text-xs text-red-500">
                    انخفاض {Math.abs(avgServiceChange)} شهر عن الفترة السابقة
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attendance Compliance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نسبة الالتزام بالحضور</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceCompliance}%</div>
            <div className="h-10 mt-2">
              <Sparkline data={attendanceTrend}>
                <SparklineSpot />
              </Sparkline>
            </div>
            <div className="flex items-center pt-1">
              {attendanceChange > 0 ? (
                <>
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <p className="text-xs text-green-500">
                    تحسن {attendanceChange}% عن الشهر السابق
                  </p>
                </>
              ) : (
                <>
                  <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  <p className="text-xs text-red-500">
                    انخفاض {Math.abs(attendanceChange)}% عن الشهر السابق
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Annual Leave Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل استخدام الإجازات</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveUsageRate}%</div>
            <div className="h-10 mt-2">
              <Sparkline data={leaveUsageTrend}>
                <SparklineSpot />
              </Sparkline>
            </div>
            <div className="flex items-center pt-1">
              {leaveUsageChange > 0 ? (
                <>
                  <TrendingUp className="mr-1 h-3 w-3 text-blue-500" />
                  <p className="text-xs text-blue-500">
                    زيادة {leaveUsageChange}% عن الفترة السابقة
                  </p>
                </>
              ) : (
                <>
                  <TrendingDown className="mr-1 h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    انخفاض {Math.abs(leaveUsageChange)}% عن الفترة السابقة
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Analysis Dashboards */}
      <Tabs defaultValue="attendance" className="print:hidden">
        <TabsList className="mb-4">
          <TabsTrigger value="attendance">تحليل الحضور والغياب</TabsTrigger>
          <TabsTrigger value="leave">تحليل الإجازات</TabsTrigger>
          <TabsTrigger value="contracts">متابعة العقود والتوظيف</TabsTrigger>
        </TabsList>

        {/* Attendance Analysis Dashboard */}
        <TabsContent value="attendance">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Attendance Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>توزيع حالات الحضور</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={attendanceDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {attendanceDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Attendance by Day of Week */}
            <Card>
              <CardHeader>
                <CardTitle>الحضور حسب أيام الأسبوع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceByDayData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="present" name="حاضر" fill="#4ade80" />
                      <Bar dataKey="late" name="متأخر" fill="#facc15" />
                      <Bar dataKey="absent" name="غائب" fill="#f87171" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Late Employees */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>الموظفين الأكثر تأخرًا</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الموظف
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          عدد مرات التأخير
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          إجمالي دقائق التأخير
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          آخر تأخير
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">أحمد محمد</td>
                        <td className="px-6 py-4 whitespace-nowrap">5</td>
                        <td className="px-6 py-4 whitespace-nowrap">97 دقيقة</td>
                        <td className="px-6 py-4 whitespace-nowrap">15 يونيو 2023</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">سارة خالد</td>
                        <td className="px-6 py-4 whitespace-nowrap">4</td>
                        <td className="px-6 py-4 whitespace-nowrap">72 دقيقة</td>
                        <td className="px-6 py-4 whitespace-nowrap">18 يونيو 2023</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">فهد سعيد</td>
                        <td className="px-6 py-4 whitespace-nowrap">3</td>
                        <td className="px-6 py-4 whitespace-nowrap">45 دقيقة</td>
                        <td className="px-6 py-4 whitespace-nowrap">10 يونيو 2023</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Leave Analysis Dashboard */}
        <TabsContent value="leave">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Leave Distribution by Type */}
            <Card>
              <CardHeader>
                <CardTitle>توزيع الإجازات حسب النوع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leaveDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {leaveDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Leaves */}
            <Card>
              <CardHeader>
                <CardTitle>الإجازات المجدولة للأسبوعين القادمين</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الموظف
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          نوع الإجازة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          البداية
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          النهاية
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">محمد أحمد</td>
                        <td className="px-6 py-4 whitespace-nowrap">سنوية</td>
                        <td className="px-6 py-4 whitespace-nowrap">25 يونيو 2023</td>
                        <td className="px-6 py-4 whitespace-nowrap">30 يونيو 2023</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">نورة سعد</td>
                        <td className="px-6 py-4 whitespace-nowrap">سنوية</td>
                        <td className="px-6 py-4 whitespace-nowrap">27 يونيو 2023</td>
                        <td className="px-6 py-4 whitespace-nowrap">1 يوليو 2023</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">خالد عبدالله</td>
                        <td className="px-6 py-4 whitespace-nowrap">مرضية</td>
                        <td className="px-6 py-4 whitespace-nowrap">24 يونيو 2023</td>
                        <td className="px-6 py-4 whitespace-nowrap">26 يونيو 2023</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contracts and Employment Dashboard */}
        <TabsContent value="contracts">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Employee Trends */}
            <Card>
              <CardHeader>
                <CardTitle>تحليل التوظيف والمغادرة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={employeeTrendsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="joined" name="انضم" fill="#4ade80" />
                      <Bar dataKey="left" name="غادر" fill="#f87171" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Expiring Contracts */}
            <Card>
              <CardHeader>
                <CardTitle>العقود التي ستنتهي قريبًا</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الموظف
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المنصب
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          تاريخ انتهاء العقد
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المتبقي
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(expiringContracts || []).slice(0, 3).map((contract, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">{contract.employees?.full_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{contract.employees?.position}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{format(new Date(contract.end_date), 'yyyy-MM-dd')}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {Math.ceil((new Date(contract.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} يوم
                          </td>
                        </tr>
                      ))}
                      {!expiringContracts?.length && (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center">لا توجد عقود ستنتهي قريبًا</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Ending Probation Periods */}
            <Card>
              <CardHeader>
                <CardTitle>نهاية فترات التجربة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الموظف
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المنصب
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          تاريخ انتهاء فترة التجربة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المتبقي
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(endingProbations || []).slice(0, 3).map((probation, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">{probation.employees?.full_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{probation.employees?.position}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{format(new Date(probation.probation_end_date), 'yyyy-MM-dd')}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {Math.ceil((new Date(probation.probation_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} يوم
                          </td>
                        </tr>
                      ))}
                      {!endingProbations?.length && (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center">لا توجد فترات تجربة ستنتهي قريبًا</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Summary Stats (Always visible, even in print mode) */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hrStats?.totalEmployees || 0}</div>
            <p className="text-xs text-muted-foreground">
              {hrStats?.newEmployees || 0} موظف جديد في آخر 30 يومًا
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الحضور اليوم</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hrStats?.presentToday || 0}</div>
            <p className="text-xs text-muted-foreground">
              معدل الحضور: {hrStats?.attendanceRate || 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإجازات النشطة</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hrStats?.activeLeaves || 0}</div>
            <p className="text-xs text-muted-foreground">
              {hrStats?.upcomingLeaves || 0} إجازة مجدولة للأسبوع القادم
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العقود المنتهية قريبًا</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hrStats?.expiringContracts || 0}</div>
            <p className="text-xs text-muted-foreground">
              خلال الـ 30 يومًا القادمة
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
