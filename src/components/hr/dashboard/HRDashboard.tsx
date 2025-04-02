
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  Clock, 
  AlertTriangle,
  Briefcase,
  BarChart,
  PieChart
} from "lucide-react";
import { Sparkline, SparklineSpot } from "@/components/ui/sparkline";
import { useHRStats } from "@/hooks/hr/useHRStats";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/dateUtils";

export function HRDashboard() {
  const { data: stats, isLoading } = useHRStats();
  const [period, setPeriod] = React.useState<"daily" | "weekly" | "monthly" | "quarterly">("monthly");
  
  // Sample data for sparklines - in a real implementation, this would come from the API
  const attendanceTrend = [85, 87, 82, 90, 88, 92, 89];
  const turnoverTrend = [2.3, 2.5, 2.1, 1.9, 2.4, 2.6, 2.2];
  const leaveUsageTrend = [12, 15, 10, 18, 14, 16, 13];
  const avgTenureTrend = [3.5, 3.6, 3.6, 3.7, 3.8, 3.8, 3.9];
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">جاري تحميل البيانات...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">لوحة معلومات الموارد البشرية</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="hidden md:flex">
            طباعة التقرير
          </Button>
          <Button variant="outline" size="sm" className="hidden md:flex">
            تصدير (Excel)
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="attendance">الحضور والغياب</TabsTrigger>
          <TabsTrigger value="leaves">الإجازات</TabsTrigger>
          <TabsTrigger value="contracts">العقود والتوظيف</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* KPI Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">معدل دوران الموظفين</CardTitle>
                <TrendingDown className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.3%</div>
                <div className="h-10 mt-2">
                  <Sparkline data={turnoverTrend} color="#10b981">
                    <SparklineSpot />
                  </Sparkline>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-500">↓ 0.4%</span> مقارنة بالشهر السابق
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">متوسط مدة الخدمة</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.8 سنوات</div>
                <div className="h-10 mt-2">
                  <Sparkline data={avgTenureTrend} color="#10b981">
                    <SparklineSpot />
                  </Sparkline>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-500">↑ 0.2</span> مقارنة بالربع السابق
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">نسبة الالتزام بالحضور</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.attendanceRate || 0}%</div>
                <div className="h-10 mt-2">
                  <Sparkline data={attendanceTrend} color="#10b981">
                    <SparklineSpot />
                  </Sparkline>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-500">↑ 4%</span> مقارنة بالشهر السابق
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">معدل استخدام الإجازات</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">14%</div>
                <div className="h-10 mt-2">
                  <Sparkline data={leaveUsageTrend} color="#f43f5e">
                    <SparklineSpot />
                  </Sparkline>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-red-500">↓ 2%</span> مقارنة بالشهر السابق
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalEmployees || 0}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500">{stats?.newEmployees || 0} موظف جديد</span> هذا الشهر
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الحضور اليوم</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.presentToday || 0}</div>
                <p className="text-xs text-muted-foreground">
                  من أصل {stats?.totalEmployees || 0} موظف
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الإجازات النشطة</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeLeaves || 0}</div>
                <p className="text-xs text-muted-foreground">
                  و {stats?.upcomingLeaves || 0} إجازة قادمة هذا الأسبوع
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">عقود ستنتهي قريباً</CardTitle>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.expiringContracts || 0}</div>
                <p className="text-xs text-muted-foreground">
                  خلال الشهر القادم
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Employee Distribution */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1 md:col-span-2 lg:col-span-2">
              <CardHeader>
                <CardTitle>إحصائيات الموظفين حسب القسم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <BarChart className="h-16 w-16 text-muted-foreground opacity-50" />
                  <span className="mr-4 text-muted-foreground">سيتم عرض الرسم البياني هنا...</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>توزيع حالات الموظفين</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <PieChart className="h-16 w-16 text-muted-foreground opacity-50" />
                  <span className="mr-4 text-muted-foreground">سيتم عرض المخطط الدائري هنا...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="attendance" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">تحليل الحضور والغياب</h3>
            <div className="flex gap-2">
              <Tabs value={period} onValueChange={(v) => setPeriod(v as any)} className="w-[400px]">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="daily">يومي</TabsTrigger>
                  <TabsTrigger value="weekly">أسبوعي</TabsTrigger>
                  <TabsTrigger value="monthly">شهري</TabsTrigger>
                  <TabsTrigger value="quarterly">ربع سنوي</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الحضور</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.presentToday || 0}</div>
                <p className="text-xs text-muted-foreground">
                  موظف حاضر خلال {period === "daily" ? "اليوم" : period === "weekly" ? "الأسبوع" : period === "monthly" ? "الشهر" : "الربع"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">التأخير</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6</div>
                <p className="text-xs text-muted-foreground">
                  حالة تأخير خلال {period === "daily" ? "اليوم" : period === "weekly" ? "الأسبوع" : period === "monthly" ? "الشهر" : "الربع"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الغياب</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">
                  حالة غياب خلال {period === "daily" ? "اليوم" : period === "weekly" ? "الأسبوع" : period === "monthly" ? "الشهر" : "الربع"}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>الحضور والغياب حسب اليوم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <BarChart className="h-16 w-16 text-muted-foreground opacity-50" />
                  <span className="mr-4 text-muted-foreground">سيتم عرض الرسم البياني هنا...</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>توزيع حالات الحضور</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[240px] flex items-center justify-center">
                  <PieChart className="h-16 w-16 text-muted-foreground opacity-50" />
                  <span className="mr-4 text-muted-foreground">سيتم عرض المخطط الدائري هنا...</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>الموظفين الأكثر تأخراً</CardTitle>
              </CardHeader>
              <CardContent className="px-2">
                <div className="rounded-md border">
                  <div className="grid grid-cols-3 p-2 text-sm font-medium">
                    <div>الاسم</div>
                    <div>عدد مرات التأخير</div>
                    <div>إجمالي ساعات التأخير</div>
                  </div>
                  <div className="divide-y">
                    <div className="grid grid-cols-3 p-2 text-sm">
                      <div>أحمد محمد</div>
                      <div>5</div>
                      <div>3.5 ساعة</div>
                    </div>
                    <div className="grid grid-cols-3 p-2 text-sm">
                      <div>سارة علي</div>
                      <div>3</div>
                      <div>2.25 ساعة</div>
                    </div>
                    <div className="grid grid-cols-3 p-2 text-sm">
                      <div>خالد العمري</div>
                      <div>2</div>
                      <div>1.5 ساعة</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="leaves" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">تحليل الإجازات</h3>
            <div className="flex gap-2">
              <Tabs value={period} onValueChange={(v) => setPeriod(v as any)} className="w-[400px]">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="daily">يومي</TabsTrigger>
                  <TabsTrigger value="weekly">أسبوعي</TabsTrigger>
                  <TabsTrigger value="monthly">شهري</TabsTrigger>
                  <TabsTrigger value="quarterly">ربع سنوي</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الإجازات</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeLeaves || 0}</div>
                <p className="text-xs text-muted-foreground">
                  إجازة خلال {period === "quarterly" ? "الربع" : period === "monthly" ? "الشهر" : period === "weekly" ? "الأسبوع" : "اليوم"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الإجازات المعتمدة</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(stats?.activeLeaves || 0) - 2}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((((stats?.activeLeaves || 0) - 2) / (stats?.activeLeaves || 1)) * 100)}% من إجمالي الإجازات
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">قيد الانتظار</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((2 / (stats?.activeLeaves || 1)) * 100)}% من إجمالي الإجازات
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>توزيع الإجازات حسب النوع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <BarChart className="h-16 w-16 text-muted-foreground opacity-50" />
                  <span className="mr-4 text-muted-foreground">سيتم عرض الرسم البياني هنا...</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>نسب الإجازات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <PieChart className="h-16 w-16 text-muted-foreground opacity-50" />
                  <span className="mr-4 text-muted-foreground">سيتم عرض المخطط الدائري هنا...</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>الإجازات المجدولة للأسبوعين القادمين</CardTitle>
            </CardHeader>
            <CardContent className="px-2">
              <div className="rounded-md border">
                <div className="grid grid-cols-4 p-2 text-sm font-medium">
                  <div>الاسم</div>
                  <div>نوع الإجازة</div>
                  <div>تاريخ البداية</div>
                  <div>تاريخ النهاية</div>
                </div>
                <div className="divide-y">
                  <div className="grid grid-cols-4 p-2 text-sm">
                    <div>محمد السالم</div>
                    <div>سنوية</div>
                    <div>{formatDate('2023-10-25')}</div>
                    <div>{formatDate('2023-10-30')}</div>
                  </div>
                  <div className="grid grid-cols-4 p-2 text-sm">
                    <div>نورة الأحمد</div>
                    <div>مرضية</div>
                    <div>{formatDate('2023-10-26')}</div>
                    <div>{formatDate('2023-10-28')}</div>
                  </div>
                  <div className="grid grid-cols-4 p-2 text-sm">
                    <div>فهد العلي</div>
                    <div>طارئة</div>
                    <div>{formatDate('2023-10-27')}</div>
                    <div>{formatDate('2023-10-27')}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contracts" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">العقود والتوظيف</h3>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>الموظفين الجدد مقابل المغادرين</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <BarChart className="h-16 w-16 text-muted-foreground opacity-50" />
                  <span className="mr-4 text-muted-foreground">سيتم عرض الرسم البياني هنا...</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>توزيع مدة الخدمة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <BarChart className="h-16 w-16 text-muted-foreground opacity-50" />
                  <span className="mr-4 text-muted-foreground">سيتم عرض الرسم البياني هنا...</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>العقود التي ستنتهي خلال 60 يوماً</CardTitle>
            </CardHeader>
            <CardContent className="px-2">
              <div className="rounded-md border">
                <div className="grid grid-cols-4 p-2 text-sm font-medium">
                  <div>الاسم</div>
                  <div>المنصب</div>
                  <div>تاريخ نهاية العقد</div>
                  <div>الأيام المتبقية</div>
                </div>
                <div className="divide-y">
                  <div className="grid grid-cols-4 p-2 text-sm">
                    <div>عبدالله الخالد</div>
                    <div>مطور برمجيات</div>
                    <div>{formatDate('2023-11-15')}</div>
                    <div>30 يوم</div>
                  </div>
                  <div className="grid grid-cols-4 p-2 text-sm">
                    <div>سارة العبدالله</div>
                    <div>مصمم جرافيك</div>
                    <div>{formatDate('2023-11-30')}</div>
                    <div>45 يوم</div>
                  </div>
                  <div className="grid grid-cols-4 p-2 text-sm">
                    <div>محمد القحطاني</div>
                    <div>محاسب</div>
                    <div>{formatDate('2023-12-10')}</div>
                    <div>55 يوم</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>الموظفين في فترة الاختبار</CardTitle>
            </CardHeader>
            <CardContent className="px-2">
              <div className="rounded-md border">
                <div className="grid grid-cols-4 p-2 text-sm font-medium">
                  <div>الاسم</div>
                  <div>المنصب</div>
                  <div>تاريخ التعيين</div>
                  <div>نهاية فترة الاختبار</div>
                </div>
                <div className="divide-y">
                  <div className="grid grid-cols-4 p-2 text-sm">
                    <div>أحمد الناصر</div>
                    <div>مدير مبيعات</div>
                    <div>{formatDate('2023-09-01')}</div>
                    <div>{formatDate('2023-12-01')}</div>
                  </div>
                  <div className="grid grid-cols-4 p-2 text-sm">
                    <div>منال العتيبي</div>
                    <div>مسؤول موارد بشرية</div>
                    <div>{formatDate('2023-09-15')}</div>
                    <div>{formatDate('2023-12-15')}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
