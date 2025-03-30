
import { useState } from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { EmployeesTab } from "@/components/hr/tabs/EmployeesTab";
import { AttendanceTab } from "@/components/hr/tabs/AttendanceTab";
import { CompensationTab } from "@/components/hr/tabs/CompensationTab";
import { TrainingTab } from "@/components/hr/tabs/TrainingTab";
import { ReportsTab } from "@/components/hr/tabs/ReportsTab";
import { useHRPermissions } from "@/hooks/hr/useHRPermissions";
import { useHRStats } from "@/hooks/hr/useHRStats";
import { Briefcase, Clock, Users, GraduationCap, DollarSign, BarChart } from "lucide-react";
import { Loader2 } from "lucide-react";

const HRDashboard = () => {
  const [activeTab, setActiveTab] = useState("employees");
  const { data: permissions, isLoading: isLoadingPermissions } = useHRPermissions();
  const { data: stats, isLoading: isLoadingStats } = useHRStats();
  
  const isLoading = isLoadingPermissions || isLoadingStats;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <AdminHeader />
        <div className="container mx-auto px-4 py-8 flex-grow flex justify-center items-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg">جاري تحميل البيانات...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!permissions?.canViewHR) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <AdminHeader />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <Card className="p-8 max-w-lg mx-auto text-center">
            <h2 className="text-xl font-bold mb-2">لا يوجد صلاحية</h2>
            <p className="text-gray-600">عذراً، ليس لديك صلاحية الوصول إلى نظام إدارة شؤون الموظفين.</p>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">نظام إدارة شؤون الموظفين</h1>
          
          {/* HR Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6 flex items-center">
                <div className="rounded-full p-3 bg-blue-100 mr-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">إجمالي الموظفين</p>
                  <p className="text-2xl font-bold">{stats?.totalEmployees || 0}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6 flex items-center">
                <div className="rounded-full p-3 bg-green-100 mr-4">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">نسبة الحضور</p>
                  <p className="text-2xl font-bold">{stats?.attendanceRate || 0}%</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6 flex items-center">
                <div className="rounded-full p-3 bg-purple-100 mr-4">
                  <GraduationCap className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">التدريبات القادمة</p>
                  <p className="text-2xl font-bold">{stats?.pendingTrainings || 0}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6 flex items-center">
                <div className="rounded-full p-3 bg-yellow-100 mr-4">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">العقود المنتهية قريباً</p>
                  <p className="text-2xl font-bold">{stats?.expiringContracts || 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-5 mb-8">
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>الموظفون</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>الحضور والإجازات</span>
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span>التدريب والتطوير</span>
            </TabsTrigger>
            <TabsTrigger value="compensation" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>التعويضات</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span>التقارير</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="employees">
            <EmployeesTab />
          </TabsContent>
          
          <TabsContent value="attendance">
            <AttendanceTab />
          </TabsContent>
          
          <TabsContent value="training">
            <TrainingTab />
          </TabsContent>
          
          <TabsContent value="compensation">
            <CompensationTab />
          </TabsContent>
          
          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default HRDashboard;
