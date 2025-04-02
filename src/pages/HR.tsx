
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { HRTabs } from '@/components/hr/HRTabs';
import { HRDashboardOverview } from '@/components/hr/dashboard/HRDashboardOverview';

// Additional imports for other HR tabs
import { EmployeesList } from '@/components/hr/employees/EmployeesList';
import { AttendanceTab } from '@/components/hr/tabs/AttendanceTab';
import { CompensationTab } from '@/components/hr/tabs/CompensationTab';
import { LeavesManagement } from '@/components/hr/leaves/LeavesManagement';
import { TrainingTab } from '@/components/hr/tabs/TrainingTab';
import { ReportsTab } from '@/components/hr/tabs/ReportsTab';
import { ContractAlerts } from '@/components/hr/contract-alerts/ContractAlerts';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Footer } from '@/components/layout/Footer';

const HR = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <>
      <AdminHeader />
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-right">إدارة الموارد البشرية</h1>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث..."
              className="pl-10 pr-4 text-right"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4" dir="rtl">
          <TabsList className="w-full grid grid-cols-3 md:grid-cols-7 text-right">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="employees">الموظفين</TabsTrigger>
            <TabsTrigger value="attendance">الحضور</TabsTrigger>
            <TabsTrigger value="leaves">الإجازات</TabsTrigger>
            <TabsTrigger value="compensation">التعويضات</TabsTrigger>
            <TabsTrigger value="training">التدريب</TabsTrigger>
            <TabsTrigger value="reports">التقارير</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <HRDashboardOverview />
          </TabsContent>
          
          <TabsContent value="employees" className="space-y-4">
            <EmployeesList />
          </TabsContent>
          
          <TabsContent value="attendance" className="space-y-4">
            <AttendanceTab />
          </TabsContent>
          
          <TabsContent value="leaves" className="space-y-4">
            <LeavesManagement />
          </TabsContent>
          
          <TabsContent value="compensation" className="space-y-4">
            <CompensationTab />
          </TabsContent>
          
          <TabsContent value="training" className="space-y-4">
            <TrainingTab />
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-4">
            <ReportsTab />
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </>
  );
};

export default HR;
