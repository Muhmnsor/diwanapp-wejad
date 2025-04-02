import React, { useState } from "react";
import { HRTabs } from "@/components/hr/HRTabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Sparkline, SparklineSpot } from "@/components/ui/sparkline";
import { useHRStats } from "@/hooks/hr/useHRStats";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Users, 
  UserCheck, 
  UserMinus, 
  Clock, 
  Calendar, 
  BarChart3, 
  PieChart,
  FileText,
  Download,
  RefreshCw,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addMonths, format, subMonths } from "date-fns";
import { ar } from "date-fns/locale";

// Mock data generator for sparklines
const generateMockData = (length: number, min: number, max: number, trend: "up" | "down" | "stable" = "up") => {
  const data = [];
  let value = Math.floor(Math.random() * (max - min) + min);
  
  for (let i = 0; i < length; i++) {
    if (trend === "up") {
      value += Math.floor(Math.random() * 5);
    } else if (trend === "down") {
      value -= Math.floor(Math.random() * 5);
    } else {
      value += Math.floor(Math.random() * 10) - 5;
    }
    
    // Keep within bounds
    value = Math.max(min, Math.min(max, value));
    data.push(value);
  }
  
  return data;
};

// Trend indicator component
const TrendIndicator = ({ value, reverse = false }: { value: number, reverse?: boolean }) => {
  if (value === 0) {
    return <Minus className="h-4 w-4 text-gray-500" />;
  }
  
  const isPositive = reverse ? value < 0 : value > 0;
  const absValue = Math.abs(value);
  
  return (
    <div className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
      {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
      <span className="text-xs font-medium">{absValue}%</span>
    </div>
  );
};

// KPI Card with Sparkline
const KPICard = ({ 
  title, 
  value, 
  icon: Icon, 
  sparklineData, 
  trend,
  color = "#4ade80",
  previousValue,
  info
}: { 
  title: string, 
  value: string | number, 
  icon: React.ElementType, 
  sparklineData: number[],
  trend: number,
  color?: string,
  previousValue?: string | number,
  info?: string
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold">{value}</div>
          <TrendIndicator value={trend} />
        </div>
        
        {previousValue && (
          <div className="text-xs text-muted-foreground">
            القيمة السابقة: {previousValue}
          </div>
        )}
        
        {info && (
          <div className="text-xs text-muted-foreground">
            {info}
          </div>
        )}
        
        <Sparkline data={sparklineData} height={30} color={color}>
          <SparklineSpot spotColors={{ endSpot: color }} />
        </Sparkline>
      </CardContent>
    </Card>
  );
};

// Attendance Analysis Card
const AttendanceAnalysisCard = () => {
  const attendanceData = {
    onTime: 85,
    late: 10,
    absent: 5
  };
  
  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>تحليل الحضور</CardTitle>
        <CardDescription>تحليل أنماط الحضور والالتزام بالمواعيد</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-green-600 text-2xl font-bold">{attendanceData.onTime}%</div>
            <div className="text-sm text-muted-foreground">حضور في الموعد</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-yellow-600 text-2xl font-bold">{attendanceData.late}%</div>
            <div className="text-sm text-muted-foreground">متأخر</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-red-600 text-2xl font-bold">{attendanceData.absent}%</div>
            <div className="text-sm text-muted-foreground">غائب</div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="h-4 w-full rounded-full overflow-hidden bg-gray-100 flex">
            <div className="h-full bg-green-500" style={{ width: `${attendanceData.onTime}%` }}></div>
            <div className="h-full bg-yellow-500" style={{ width: `${attendanceData.late}%` }}></div>
            <div className="h-full bg-red-500" style={{ width: `${attendanceData.absent}%` }}></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <div>0%</div>
            <div>50%</div>
            <div>100%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Leave Analysis Card
const LeaveAnalysisCard = () => {
  const leaveData = [
    { name: "إجازة سنوية", value: 45, color: "#4ade80" },
    { name: "إجازة مرضية", value: 30, color: "#f97316" },
    { name: "إجازة خاصة", value: 15, color: "#8b5cf6" },
    { name: "أخرى", value: 10, color: "#94a3b8" }
  ];
  
  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>تحليل الإجازات</CardTitle>
        <CardDescription>توزيع الإجازات حسب النوع</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Chart visualization placeholder */}
          <div className="aspect-square relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <PieChart className="h-24 w-24 text-muted" />
            </div>
          </div>
          
          <div className="space-y-2">
            {leaveData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm">{item.name}</span>
                </div>
                <span className="font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Contracts Analysis Card
const ContractsAnalysisCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>تحليل العقود</CardTitle>
        <CardDescription>العقود المنتهية والمتجددة</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-lg font-medium">8</div>
            <div className="text-sm text-muted-foreground">عقود تنتهي هذا الشهر</div>
          </div>
          <div>
            <div className="text-lg font-medium">12</div>
            <div className="text-sm text-muted-foreground">عقود تجدد هذا الربع</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium">نسبة التجديد</div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: "85%" }}></div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <div>85% معدل التجديد</div>
            <div>15% عدم التجديد</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Training Analysis Card
const TrainingAnalysisCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>تحليل التدريب</CardTitle>
        <CardDescription>إحصائيات التدريب والتطوير</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-lg font-medium">24</div>
            <div className="text-sm text-muted-foreground">تدريب مكتمل</div>
          </div>
          <div>
            <div className="text-lg font-medium">8</div>
            <div className="text-sm text-muted-foreground">تدريب قيد التنفيذ</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium">نسبة إكمال التدريب</div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: "75%" }}></div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <div>75% مكتمل</div>
            <div>25% قيد التنفيذ</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main HR Page Component
const HR = () => {
  const { data: hrStats, isLoading, error } = useHRStats();
  const [dateRange, setDateRange] = useState({
    from: subMonths(new Date(), 3),
    to: new Date(),
  });
  const [department, setDepartment] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("month");
  
  // Mock data for new KPIs
  const turnoverRate = {
    current: 5.2,
    previous: 6.8,
    trend: -1.6,
    sparkData: generateMockData(12, 4, 8, "down")
  };
  
  const avgServiceDuration = {
    current: 3.5,
    previous: 3.2,
    trend: 0.3,
    sparkData: generateMockData(12, 2, 4, "up")
  };
  
  const attendanceComplianceRate = {
    current: 94.8,
    previous: 92.1,
    trend: 2.7,
    sparkData: generateMockData(12, 85, 98, "up")
  };
  
  const annualLeaveUsage = {
    current: 68.5,
    previous: 72.3,
    trend: -3.8,
    sparkData: generateMockData(12, 60, 80, "down")
  };
  
  const refreshData = () => {
    // In a real implementation, this would refetch the data
    console.log("Refreshing data...");
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="system">نظام الموارد البشرية</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Dashboard Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-3xl font-bold tracking-tight">لوحة معلومات الموارد البشرية</h2>
              
              <div className="flex flex-wrap gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 me-2" />
                      تصفية
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="font-medium">القسم</h3>
                        <Select value={department} onValueChange={setDepartment}>
                          <SelectTrigger>
                            <SelectValue placeholder="جميع الأقسام" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">جميع الأقسام</SelectItem>
                            <SelectItem value="engineering">الهندسة</SelectItem>
                            <SelectItem value="marketing">التسويق</SelectItem>
                            <SelectItem value="hr">الموارد البشرية</SelectItem>
                            <SelectItem value="finance">المالية</SelectItem>
                            <SelectItem value="it">تكنولوجيا المعلومات</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-medium">المدة الزمنية</h3>
                        <Select value={timeRange} onValueChange={setTimeRange}>
                          <SelectTrigger>
                            <SelectValue placeholder="الشهر الحالي" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="day">اليوم</SelectItem>
                            <SelectItem value="week">الأسبوع</SelectItem>
                            <SelectItem value="month">الشهر</SelectItem>
                            <SelectItem value="quarter">ربع السنة</SelectItem>
                            <SelectItem value="year">السنة</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-medium">النطاق الزمني المخصص</h3>
                        <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button size="sm">تطبيق التصفية</Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Button variant="outline" size="sm" onClick={refreshData}>
                  <RefreshCw className="h-4 w-4 me-2" />
                  تحديث
                </Button>
                
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 me-2" />
                  تصدير
                </Button>
              </div>
            </div>
            
            {/* Main KPIs */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard 
                title="إجمالي الموظفين"
                value={hrStats?.totalEmployees || 0}
                icon={Users}
                sparklineData={generateMockData(12, 10, 50, "up")}
                trend={2.5}
                color="#6E59A5"
                info={`${hrStats?.newEmployees || 0} موظف جديد هذا الشهر`}
              />
              
              <KPICard 
                title="معدل دوران الموظفين"
                value={`${turnoverRate.current}%`}
                previousValue={`${turnoverRate.previous}%`}
                icon={UserMinus}
                sparklineData={turnoverRate.sparkData}
                trend={turnoverRate.trend}
                color="#ea384c"
              />
              
              <KPICard 
                title="متوسط مدة الخدمة"
                value={`${avgServiceDuration.current} سنوات`}
                previousValue={`${avgServiceDuration.previous} سنوات`}
                icon={Clock}
                sparklineData={avgServiceDuration.sparkData}
                trend={avgServiceDuration.trend}
                color="#9b87f5"
              />
              
              <KPICard 
                title="معدل الالتزام بالحضور"
                value={`${attendanceComplianceRate.current}%`}
                previousValue={`${attendanceComplianceRate.previous}%`}
                icon={UserCheck}
                sparklineData={attendanceComplianceRate.sparkData}
                trend={attendanceComplianceRate.trend}
                color="#4ade80"
              />

              <KPICard 
                title="نسبة استخدام الإجازات"
                value={`${annualLeaveUsage.current}%`}
                previousValue={`${annualLeaveUsage.previous}%`}
                icon={Calendar}
                sparklineData={annualLeaveUsage.sparkData}
                trend={annualLeaveUsage.trend}
                color="#7E69AB"
              />
            </div>
            
            {/* Analysis Dashboard */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
              <AttendanceAnalysisCard />
              <LeaveAnalysisCard />
              <ContractsAnalysisCard />
              <TrainingAnalysisCard />
            </div>
          </TabsContent>
          
          <TabsContent value="system">
            <HRTabs />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HR;
