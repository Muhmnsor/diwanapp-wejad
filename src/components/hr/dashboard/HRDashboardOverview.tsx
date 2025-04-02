
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines';
import { ArrowUp, ArrowDown, Users, CalendarClock, CalendarDays, FileBarChart, Clock, AlertTriangle } from 'lucide-react';
import { useHRStats } from '@/hooks/hr/useHRStats';

export function HRDashboardOverview() {
  const { data: stats, isLoading } = useHRStats();
  const [timeFilter, setTimeFilter] = useState('month');

  // Mock data for the sparklines
  const attendanceData = [65, 70, 62, 80, 75, 65, 68, 75, 82, 85, 76];
  const employeesData = [10, 12, 11, 14, 15, 13, 16, 18, 17, 19, 20];
  const leavesData = [2, 4, 3, 5, 2, 3, 1, 2, 4, 3, 2];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="اختر الفترة الزمنية" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">هذا الأسبوع</SelectItem>
            <SelectItem value="month">هذا الشهر</SelectItem>
            <SelectItem value="quarter">هذا الربع</SelectItem>
            <SelectItem value="year">هذه السنة</SelectItem>
          </SelectContent>
        </Select>
        
        <h2 className="text-2xl font-bold">لوحة معلومات الموارد البشرية</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Employee KPI Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <Users className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-right text-lg">إجمالي الموظفين</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center text-green-500">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span className="text-sm">+{stats?.newEmployees || 0}</span>
              </div>
              <div className="text-3xl font-bold">{isLoading ? "..." : stats?.totalEmployees || 0}</div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{stats?.newEmployees || 0} موظفين جدد هذا الشهر</p>
            <Sparklines data={employeesData} height={30} margin={5}>
              <SparklinesLine color="#3b82f6" />
              <SparklinesSpots size={2} style={{ fill: "#3b82f6" }} />
            </Sparklines>
          </CardContent>
        </Card>
        
        {/* Attendance KPI Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CalendarClock className="h-5 w-5 text-green-500" />
              <CardTitle className="text-right text-lg">الحضور اليوم</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <div className={`flex items-center ${stats?.attendanceRate > 70 ? 'text-green-500' : 'text-amber-500'}`}>
                {stats?.attendanceRate > 70 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                <span className="text-sm">{stats?.attendanceRate || 0}%</span>
              </div>
              <div className="text-3xl font-bold">{isLoading ? "..." : stats?.presentToday || 0}</div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{stats?.attendanceRate || 0}% نسبة الحضور</p>
            <Sparklines data={attendanceData} height={30} margin={5}>
              <SparklinesLine color="#10b981" />
              <SparklinesSpots size={2} style={{ fill: "#10b981" }} />
            </Sparklines>
          </CardContent>
        </Card>
        
        {/* Leave KPI Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CalendarDays className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-right text-lg">الإجازات النشطة</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center text-blue-500">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-sm">{stats?.upcomingLeaves || 0} قادمة</span>
              </div>
              <div className="text-3xl font-bold">{isLoading ? "..." : stats?.activeLeaves || 0}</div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{stats?.upcomingLeaves || 0} إجازات متوقعة الأسبوع القادم</p>
            <Sparklines data={leavesData} height={30} margin={5}>
              <SparklinesLine color="#f59e0b" />
              <SparklinesSpots size={2} style={{ fill: "#f59e0b" }} />
            </Sparklines>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="alerts" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="alerts">التنبيهات والإشعارات</TabsTrigger>
          <TabsTrigger value="attendance">إحصائيات الحضور</TabsTrigger>
          <TabsTrigger value="contracts">العقود والتدريب</TabsTrigger>
        </TabsList>
        
        <TabsContent value="alerts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-right">الإشعارات والتنبيهات</CardTitle>
              <CardDescription className="text-right">آخر التنبيهات المتعلقة بالموارد البشرية</CardDescription>
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
                {(stats?.expiringContracts === 0 && stats?.pendingTrainings === 0) && (
                  <div className="p-3 bg-green-50 rounded-lg text-right">
                    <p className="font-medium">لا توجد تنبيهات حالية</p>
                    <p className="text-sm text-muted-foreground">جميع الأمور تسير بشكل جيد</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="attendance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-right">إحصائيات الحضور</CardTitle>
              <CardDescription className="text-right">تحليل بيانات الحضور للفترة المحددة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-right mb-2">معدل الحضور الأسبوعي</h3>
                    <div className="h-40 flex items-center justify-center">
                      <p className="text-muted-foreground text-center">سيتم هنا عرض رسم بياني للحضور الأسبوعي</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-right mb-2">أوقات الحضور والانصراف</h3>
                    <div className="h-40 flex items-center justify-center">
                      <p className="text-muted-foreground text-center">سيتم هنا عرض إحصائيات أوقات الحضور والانصراف</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" className="ml-2">تصدير التقرير</Button>
                  <Button>عرض التفاصيل</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contracts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-right">العقود والتدريب</CardTitle>
              <CardDescription className="text-right">متابعة العقود وحالة التدريب للموظفين</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.expiringContracts > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <Button variant="outline" size="sm">عرض التفاصيل</Button>
                    <div className="text-right">
                      <p className="font-medium">{stats?.expiringContracts} عقود ستنتهي قريباً</p>
                      <p className="text-sm text-muted-foreground">يجب مراجعة حالة هذه العقود</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-lg mb-2">لا توجد عقود قريبة الانتهاء حالياً</p>
                  <p className="text-sm text-muted-foreground">جميع العقود سارية وفي حالة جيدة</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
