
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { KPICard } from "./components/KPICard";
import { AttendancePanel } from "./panels/AttendancePanel";
import { LeavePanel } from "./panels/LeavePanel";
import { ContractsPanel } from "./panels/ContractsPanel";
import { DateRangePicker } from "./components/DateRangePicker";
import { useHRStats } from "@/hooks/hr/useHRStats";
import { 
  Users, 
  CalendarClock, 
  FileText, 
  BarChart,
  TrendingUp,
  TrendingDown,
  Clock,
  CalendarDays
} from "lucide-react";

export function HRDashboard() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null);
  const [department, setDepartment] = useState<string>("all");
  const { data: hrStats, isLoading } = useHRStats();
  
  return (
    <div className="space-y-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <h2 className="text-2xl font-bold">لوحة التحكم الرئيسية</h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <select 
            className="border rounded p-2 bg-background"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="all">جميع الأقسام</option>
            <option value="engineering">قسم الهندسة</option>
            <option value="marketing">قسم التسويق</option>
            <option value="hr">قسم الموارد البشرية</option>
          </select>
          
          <DateRangePicker 
            onChange={setDateRange} 
            value={dateRange}
            placeholder="اختر نطاق زمني" 
          />
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard 
          title="إجمالي الموظفين"
          value={isLoading ? "--" : hrStats?.totalEmployees.toString() || "0"}
          icon={<Users className="h-5 w-5" />}
          description="عدد الموظفين الحاليين"
          trend={{
            value: hrStats?.newEmployees || 0,
            label: "موظفين جدد هذا الشهر",
            direction: "up"
          }}
          sparkData={[25, 27, 28, 30, 32, 30, 31]}
        />
        
        <KPICard 
          title="معدل الحضور"
          value={isLoading ? "--" : `${hrStats?.attendanceRate}%` || "0%"}
          icon={<CalendarClock className="h-5 w-5" />}
          description="نسبة الحضور اليومية"
          trend={{
            value: 3,
            label: "زيادة عن الشهر السابق",
            direction: "up"
          }}
          sparkData={[85, 90, 87, 92, 89, 93, 95]}
          sparkColor="#4ade80"
        />
        
        <KPICard 
          title="معدل دوران الموظفين"
          value="6.2%"
          icon={<TrendingDown className="h-5 w-5" />}
          description="دوران الموظفين آخر 3 أشهر"
          trend={{
            value: 1.5,
            label: "انخفاض عن الربع السابق",
            direction: "down",
            isPositive: true
          }}
          sparkData={[10, 8, 6.5, 7, 6.2, 6.8, 6.2]}
          sparkColor="#f97316"
        />
        
        <KPICard 
          title="متوسط مدة الخدمة"
          value="2.4"
          suffix="سنة"
          icon={<Clock className="h-5 w-5" />}
          description="متوسط سنوات الخدمة"
          trend={{
            value: 0.2,
            label: "زيادة عن العام السابق",
            direction: "up"
          }}
          sparkData={[1.9, 2.0, 2.1, 2.2, 2.3, 2.3, 2.4]}
          sparkColor="#8b5cf6"
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard 
          title="الحاضرين اليوم"
          value={isLoading ? "--" : hrStats?.presentToday.toString() || "0"}
          icon={<Users className="h-5 w-5" />}
          description="عدد الموظفين الحاضرين"
          trend={{
            value: hrStats?.attendanceRate || 0,
            label: "نسبة الحضور",
            suffix: "%"
          }}
          sparkData={[22, 24, 25, 27, 25, 28, 29]}
          sparkColor="#0ea5e9"
        />
        
        <KPICard 
          title="موظفين في إجازة"
          value={isLoading ? "--" : hrStats?.activeLeaves.toString() || "0"}
          icon={<CalendarDays className="h-5 w-5" />}
          description="حاليًا في إجازة"
          trend={{
            value: isLoading ? 0 : hrStats?.upcomingLeaves || 0,
            label: "إجازات الأسبوع القادم"
          }}
          sparkData={[2, 3, 5, 2, 3, 4, 3]}
          sparkColor="#d946ef"
        />
        
        <KPICard 
          title="استخدام الإجازات"
          value="65%"
          icon={<TrendingUp className="h-5 w-5" />}
          description="نسبة استخدام الإجازات السنوية"
          trend={{
            value: 5,
            label: "زيادة عن العام السابق",
            direction: "up"
          }}
          sparkData={[45, 48, 52, 55, 60, 62, 65]}
          sparkColor="#4ade80"
        />
        
        <KPICard 
          title="عقود ستنتهي قريبًا"
          value={isLoading ? "--" : hrStats?.expiringContracts.toString() || "0"}
          icon={<FileText className="h-5 w-5" />}
          description="خلال الـ 30 يوم القادمة"
          trend={{
            value: 2,
            label: "عقود انتهت هذا الشهر",
            direction: "up",
            isPositive: false
          }}
          sparkData={[1, 3, 4, 6, 5, 4, 7]}
          sparkColor="#f97316"
        />
      </div>
      
      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="w-full justify-start mb-4">
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            تحليل الحضور
          </TabsTrigger>
          <TabsTrigger value="leaves" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            تحليل الإجازات
          </TabsTrigger>
          <TabsTrigger value="contracts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            متابعة العقود
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="attendance" className="space-y-4">
          <AttendancePanel department={department} dateRange={dateRange} />
        </TabsContent>
        
        <TabsContent value="leaves" className="space-y-4">
          <LeavePanel department={department} dateRange={dateRange} />
        </TabsContent>
        
        <TabsContent value="contracts" className="space-y-4">
          <ContractsPanel department={department} dateRange={dateRange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
