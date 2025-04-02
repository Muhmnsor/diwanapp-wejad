
import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { HRTabs } from "@/components/hr/HRTabs";
import { Card } from "@/components/ui/card";
import { useHRStats } from "@/hooks/hr/useHRStats";
import { Users, CalendarClock, FileBarChart, Clock } from "lucide-react";

const HRDashboard = () => {
  const { data: stats, isLoading: isLoadingStats } = useHRStats();

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow" dir="rtl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            إدارة شؤون الموظفين
          </h1>
          <p className="text-muted-foreground">إدارة الموظفين والحضور والإجازات والرواتب</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 flex items-center space-x-4 space-x-reverse">
            <div className="p-2 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1 rtl:text-right">
              <p className="text-sm text-muted-foreground">الموظفين</p>
              <h3 className="text-2xl font-bold">
                {isLoadingStats ? "..." : stats?.totalEmployees || 0}
              </h3>
            </div>
          </Card>
          
          <Card className="p-4 flex items-center space-x-4 space-x-reverse">
            <div className="p-2 bg-green-100 rounded-full">
              <CalendarClock className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1 rtl:text-right">
              <p className="text-sm text-muted-foreground">الحضور اليوم</p>
              <h3 className="text-2xl font-bold">
                {isLoadingStats ? "..." : stats?.presentToday || 0}
              </h3>
            </div>
          </Card>
          
          <Card className="p-4 flex items-center space-x-4 space-x-reverse">
            <div className="p-2 bg-amber-100 rounded-full">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div className="flex-1 rtl:text-right">
              <p className="text-sm text-muted-foreground">نسبة الحضور</p>
              <h3 className="text-2xl font-bold">
                {isLoadingStats ? "..." : `${stats?.attendanceRate || 0}%`}
              </h3>
            </div>
          </Card>
          
          <Card className="p-4 flex items-center space-x-4 space-x-reverse">
            <div className="p-2 bg-purple-100 rounded-full">
              <FileBarChart className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1 rtl:text-right">
              <p className="text-sm text-muted-foreground">الإجازات النشطة</p>
              <h3 className="text-2xl font-bold">
                {isLoadingStats ? "..." : stats?.activeLeaves || 0}
              </h3>
            </div>
          </Card>
        </div>
        
        {/* HR Tabs Component */}
        <HRTabs />
      </div>
      
      <Footer />
    </div>
  );
};

export default HRDashboard;
