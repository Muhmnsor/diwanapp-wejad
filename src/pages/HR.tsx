
import { HRTabs } from "@/components/hr/HRTabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  ClipboardCheck, 
  FileText, 
  Award, 
  Settings
} from "lucide-react";
import { HRDashboardOverview } from "@/components/hr/dashboard/HRDashboardOverview";
import { EmployeesList } from "@/components/hr/employees/EmployeesList";
import { AttendanceManagement } from "@/components/hr/attendance/AttendanceManagement";
import { HRReports } from "@/components/hr/reports/HRReports";
import { HRSettingsTabs } from "@/components/hr/settings/HRSettingsTabs";

export default function HR() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">إدارة الموارد البشرية</h1>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-7 max-w-5xl">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">نظرة عامة</span>
          </TabsTrigger>
          <TabsTrigger value="employees" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">الموظفين</span>
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">الحضور</span>
          </TabsTrigger>
          <TabsTrigger value="leaves" className="flex items-center gap-1">
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">الإجازات</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">التقارير</span>
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-1">
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">التدريب</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">الإعدادات</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <HRDashboardOverview />
        </TabsContent>
        
        <TabsContent value="employees">
          <EmployeesList />
        </TabsContent>
        
        <TabsContent value="attendance">
          <AttendanceManagement />
        </TabsContent>
        
        <TabsContent value="leaves">
          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">إدارة الإجازات</h2>
            <p>محتوى إدارة الإجازات سيظهر هنا.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="reports">
          <HRReports />
        </TabsContent>
        
        <TabsContent value="training">
          <div className="bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">إدارة التدريب</h2>
            <p>محتوى إدارة التدريب سيظهر هنا.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <HRSettingsTabs />
        </TabsContent>
      </Tabs>
    </div>
  );
}
