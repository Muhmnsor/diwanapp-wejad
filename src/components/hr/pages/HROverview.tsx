
import React from "react";
import { useHRStats } from "@/hooks/hr/useHRStats";
import { HRStatsCard } from "@/components/hr/dashboard/HRStatsCard";
import { Users, CalendarClock, AlertCircle, Clock8, Briefcase, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mockup trend data - in a real application, this would come from the API
const mockTrends = {
  employees: [120, 122, 125, 130, 128, 132, 135],
  attendance: [92, 94, 91, 95, 93, 96, 94],
  leaves: [8, 10, 12, 8, 9, 7, 8],
  contracts: [5, 4, 3, 6, 7, 5, 4],
  trainings: [12, 15, 18, 20, 22, 25, 24]
};

export function HROverview() {
  const { data: stats, isLoading } = useHRStats();

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">نظرة عامة على الموارد البشرية</h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <HRStatsCard
            title="إجمالي الموظفين"
            value={stats?.totalEmployees || 0}
            change={3.7}
            trend={mockTrends.employees}
            icon={<Users className="h-4 w-4" />}
            loading={isLoading}
          />
          
          <HRStatsCard
            title="الموظفين الجدد"
            value={stats?.newEmployees || 0}
            change={10.5}
            trend={[3, 5, 4, 7, 8, 9, 12]}
            icon={<Users className="h-4 w-4" />}
            loading={isLoading}
          />
          
          <HRStatsCard
            title="معدل دوران الموظفين"
            value="5.2%"
            change={-1.3}
            trend={[7, 6.5, 6.8, 6, 5.8, 5.5, 5.2]}
            icon={<Briefcase className="h-4 w-4" />}
            loading={isLoading}
          />
          
          <HRStatsCard
            title="متوسط مدة الخدمة"
            value="3.5 سنوات"
            change={8.2}
            trend={[2.9, 3.0, 3.1, 3.2, 3.3, 3.4, 3.5]}
            icon={<Clock8 className="h-4 w-4" />}
            loading={isLoading}
          />
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">الحضور والإجازات</h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <HRStatsCard
            title="الحاضرون اليوم"
            value={stats?.presentToday || 0}
            change={1.2}
            trend={mockTrends.attendance}
            icon={<CalendarClock className="h-4 w-4" />}
            loading={isLoading}
          />
          
          <HRStatsCard
            title="معدل الحضور"
            value={`${stats?.attendanceRate || 0}%`}
            change={2.5}
            trend={[90, 91, 89, 92, 93, 94, 94]}
            icon={<CalendarClock className="h-4 w-4" />}
            loading={isLoading}
          />
          
          <HRStatsCard
            title="الإجازات النشطة"
            value={stats?.activeLeaves || 0}
            change={-5.0}
            trend={mockTrends.leaves}
            icon={<AlertCircle className="h-4 w-4" />}
            loading={isLoading}
          />
          
          <HRStatsCard
            title="الإجازات القادمة"
            value={stats?.upcomingLeaves || 0}
            change={15.0}
            trend={[5, 6, 4, 7, 8, 9, 10]}
            icon={<AlertCircle className="h-4 w-4" />}
            loading={isLoading}
          />
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">العقود والتطوير</h2>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <HRStatsCard
            title="العقود التي ستنتهي قريباً"
            value={stats?.expiringContracts || 0}
            change={20.0}
            trend={mockTrends.contracts}
            icon={<Briefcase className="h-4 w-4" />}
            loading={isLoading}
          />
          
          <HRStatsCard
            title="التدريبات المعلقة"
            value={stats?.pendingTrainings || 0}
            change={8.3}
            trend={mockTrends.trainings}
            icon={<GraduationCap className="h-4 w-4" />}
            loading={isLoading}
          />
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">الإحصائيات القادمة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                سيتم إضافة المزيد من الإحصائيات والرسوم البيانية قريباً.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
