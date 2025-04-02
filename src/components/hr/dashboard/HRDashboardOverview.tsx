
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHRStats } from "@/hooks/hr/useHRStats";
import { Users, UserPlus, ClipboardCheck, Calendar, Award, Clock, FileWarning, GraduationCap } from "lucide-react";
import { useEmployeeContracts } from "@/hooks/hr/useEmployeeContracts";
import { Sparklines, SparklinesLine, SparklinesSpots } from "react-sparklines";

export function HRDashboardOverview() {
  const { data: stats, isLoading } = useHRStats();
  const { expiringContracts, endingProbations } = useEmployeeContracts();

  if (isLoading) {
    return <div className="flex justify-center py-8">جاري تحميل البيانات...</div>;
  }

  const sampleData = [5, 10, 5, 20, 8, 15, 25, 12, 18, 22];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">لوحة القيادة - الموارد البشرية</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEmployees || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">موظف</div>
            <div className="h-[40px] mt-2">
              <Sparklines data={sampleData} height={40}>
                <SparklinesLine color="#4CAF50" />
                <SparklinesSpots />
              </Sparklines>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الموظفين الجدد</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.newEmployees || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">خلال آخر 30 يوم</div>
            <div className="h-[40px] mt-2">
              <Sparklines data={[3, 5, 2, 6, 8, 10, 12, 5, 9, 3]} height={40}>
                <SparklinesLine color="#2196F3" />
                <SparklinesSpots />
              </Sparklines>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الحضور اليوم</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.presentToday || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats && stats.totalEmployees > 0 
                ? `${Math.round((stats.presentToday / stats.totalEmployees) * 100)}% من الموظفين` 
                : 'لا يوجد موظفين'}
            </div>
            <div className="h-[40px] mt-2">
              <Sparklines data={[20, 22, 19, 24, 25, 24, 22, 21, 20, 23]} height={40}>
                <SparklinesLine color="#673AB7" />
                <SparklinesSpots />
              </Sparklines>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل الحضور</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.attendanceRate || 0}%</div>
            <div className="text-xs text-muted-foreground mt-1">في الشهر الحالي</div>
            <div className="h-[40px] mt-2">
              <Sparklines data={[80, 85, 90, 87, 92, 89, 93, 90, 89, 94]} height={40}>
                <SparklinesLine color="#FF9800" />
                <SparklinesSpots />
              </Sparklines>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإجازات النشطة</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeLeaves || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">إجازة حالية</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإجازات القادمة</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.upcomingLeaves || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">خلال 7 أيام</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العقود المنتهية قريباً</CardTitle>
            <FileWarning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiringContracts?.length || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">خلال 30 يوم</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تدريبات قيد التنفيذ</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingTrainings || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">تدريب</div>
          </CardContent>
        </Card>
      </div>

      {/* Contract Alerts Section */}
      {(expiringContracts?.length > 0 || endingProbations?.length > 0) && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold tracking-tight">تنبيهات العقود والفترات التجريبية</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expiringContracts && expiringContracts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>عقود تنتهي قريباً</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {expiringContracts.slice(0, 5).map(contract => (
                      <div key={contract.id} className="border-b pb-2">
                        <div className="font-medium">{contract.employees?.full_name}</div>
                        <div className="text-sm text-muted-foreground">
                          ينتهي في {new Date(contract.end_date).toLocaleDateString('ar-SA')}
                        </div>
                      </div>
                    ))}
                    {expiringContracts.length > 5 && (
                      <div className="text-sm text-blue-600">+ {expiringContracts.length - 5} عقود أخرى</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {endingProbations && endingProbations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>فترات تجريبية تنتهي قريباً</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {endingProbations.slice(0, 5).map(probation => (
                      <div key={probation.id} className="border-b pb-2">
                        <div className="font-medium">{probation.employees?.full_name}</div>
                        <div className="text-sm text-muted-foreground">
                          تنتهي في {new Date(probation.probation_end_date).toLocaleDateString('ar-SA')}
                        </div>
                      </div>
                    ))}
                    {endingProbations.length > 5 && (
                      <div className="text-sm text-blue-600">+ {endingProbations.length - 5} فترات أخرى</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
