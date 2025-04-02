
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHRStats } from "@/hooks/hr/useHRStats";
import { useEmployeeContracts } from "@/hooks/hr/useEmployeeContracts";
import { Sparkline, SparklinesLine } from "react-sparklines";
import { 
  Users, 
  UserPlus, 
  ClipboardCheck, 
  Clock, 
  UserCheck, 
  CalendarClock,
  FileWarning,
  Award
} from "lucide-react";

export function HRDashboardOverview() {
  const { data: stats, isLoading } = useHRStats();
  const { expiringContracts, endingProbations } = useEmployeeContracts();

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">جاري تحميل البيانات...</div>;
  }

  const statCards = [
    {
      title: "إجمالي الموظفين",
      value: stats?.totalEmployees || 0,
      icon: <Users className="h-5 w-5 text-blue-600" />,
      change: "+2%",
      sparklineData: [3, 5, 2, 5, 7, 8, 9, 10, stats?.totalEmployees || 0],
      sparklineColor: "#3b82f6" // blue-500
    },
    {
      title: "موظفين جدد",
      value: stats?.newEmployees || 0,
      icon: <UserPlus className="h-5 w-5 text-green-600" />,
      change: "+5%",
      sparklineData: [1, 0, 2, 0, 1, 0, 3, stats?.newEmployees || 0],
      sparklineColor: "#10b981" // green-500
    },
    {
      title: "حاضرون اليوم",
      value: stats?.presentToday || 0,
      icon: <ClipboardCheck className="h-5 w-5 text-indigo-600" />,
      change: `${stats?.attendanceRate || 0}%`,
      sparklineData: [15, 19, 22, 18, 20, 17, stats?.presentToday || 0],
      sparklineColor: "#6366f1" // indigo-500
    },
    {
      title: "إجازات نشطة",
      value: stats?.activeLeaves || 0,
      icon: <Clock className="h-5 w-5 text-amber-600" />,
      change: "",
      sparklineData: [3, 2, 4, 5, 3, 2, stats?.activeLeaves || 0],
      sparklineColor: "#d97706" // amber-600
    },
    {
      title: "معدل الحضور",
      value: `${stats?.attendanceRate || 0}%`,
      icon: <UserCheck className="h-5 w-5 text-purple-600" />,
      change: "+1%",
      sparklineData: [75, 72, 78, 80, 82, 79, stats?.attendanceRate || 0],
      sparklineColor: "#9333ea" // purple-600
    },
    {
      title: "إجازات قادمة",
      value: stats?.upcomingLeaves || 0,
      icon: <CalendarClock className="h-5 w-5 text-rose-600" />,
      change: "",
      sparklineData: [1, 2, 0, 3, 1, 2, stats?.upcomingLeaves || 0],
      sparklineColor: "#e11d48" // rose-600
    },
    {
      title: "عقود تنتهي قريباً",
      value: expiringContracts?.length || 0,
      icon: <FileWarning className="h-5 w-5 text-red-600" />,
      change: "",
      sparklineData: [2, 3, 1, 4, 2, 1, expiringContracts?.length || 0],
      sparklineColor: "#dc2626" // red-600
    },
    {
      title: "تدريبات قيد التنفيذ",
      value: stats?.pendingTrainings || 0,
      icon: <Award className="h-5 w-5 text-cyan-600" />,
      change: "",
      sparklineData: [4, 3, 5, 7, 6, 5, stats?.pendingTrainings || 0],
      sparklineColor: "#0891b2" // cyan-600
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">لوحة الموارد البشرية</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              {card.change && (
                <p className="text-xs text-muted-foreground mt-1">
                  {card.change} من الشهر الماضي
                </p>
              )}
              <div className="h-10 mt-2">
                <Sparkline 
                  data={card.sparklineData} 
                  width={100} 
                  height={30} 
                  margin={5}
                >
                  <SparklinesLine color={card.sparklineColor} />
                </Sparkline>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(expiringContracts?.length > 0 || endingProbations?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {expiringContracts?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">عقود تنتهي قريباً</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {expiringContracts.slice(0, 5).map((contract) => (
                    <li key={contract.id} className="flex justify-between border-b pb-2">
                      <span>{contract.employees.full_name}</span>
                      <span className="text-muted-foreground">
                        {new Date(contract.end_date).toLocaleDateString("ar-SA")}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          
          {endingProbations?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">فترات تجريبية تنتهي قريباً</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {endingProbations.slice(0, 5).map((probation) => (
                    <li key={probation.id} className="flex justify-between border-b pb-2">
                      <span>{probation.employees.full_name}</span>
                      <span className="text-muted-foreground">
                        {new Date(probation.probation_end_date).toLocaleDateString("ar-SA")}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
