import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { HRTabs } from "@/components/hr/HRTabs";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmployeesTab } from "@/components/hr/tabs/EmployeesTab";
import { AttendanceTab } from "@/components/hr/tabs/AttendanceTab";
import { ReportsTab } from "@/components/hr/tabs/ReportsTab";
import { ContractsTab } from "@/components/hr/tabs/ContractsTab";
import { CompensationTab } from "@/components/hr/tabs/CompensationTab";
import { TrainingTab } from "@/components/hr/tabs/TrainingTab";
import { HRSettingsTabs } from "@/components/hr/settings/HRSettingsTabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Settings } from "lucide-react";
import { ContractAlerts } from "@/components/hr/contract-alerts/ContractAlerts";

function HR() {
  const [activeTab, setActiveTab] = useState("employees");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="container mx-auto py-6">
      <Helmet>
        <title>إدارة الموارد البشرية</title>
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">نظام الموارد البشرية</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="ml-2 h-4 w-4" />
            الإعدادات
          </Button>
          <Button size="sm">
            <Plus className="ml-2 h-4 w-4" />
            إضافة موظف
          </Button>
        </div>
      </div>

      <ContractAlerts />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
        <div className="flex justify-between items-center mb-4">
          <TabsList className="grid grid-cols-6 w-auto">
            <TabsTrigger value="employees">الموظفين</TabsTrigger>
            <TabsTrigger value="attendance">الحضور</TabsTrigger>
            <TabsTrigger value="contracts">العقود</TabsTrigger>
            <TabsTrigger value="compensation">التعويضات</TabsTrigger>
            <TabsTrigger value="training">التدريب</TabsTrigger>
            <TabsTrigger value="reports">التقارير</TabsTrigger>
          </TabsList>
          
          {activeTab === "employees" && (
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث عن موظف..."
                className="pl-9 pr-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </div>

        <TabsContent value="employees">
          <EmployeesTab searchTerm={searchQuery} />
        </TabsContent>

        <TabsContent value="attendance">
          <AttendanceTab />
        </TabsContent>

        <TabsContent value="contracts">
          <ContractsTab />
        </TabsContent>

        <TabsContent value="compensation">
          <CompensationTab />
        </TabsContent>

        <TabsContent value="training">
          <TrainingTab />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default HR;
