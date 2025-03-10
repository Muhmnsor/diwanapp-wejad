
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ExpensesTab } from "./ExpensesTab";
import { TargetsTab } from "./TargetsTab";
import { ReportsTab } from "./ReportsTab";
import { ResourcesTab } from "./ResourcesTab";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";

export function FinanceDashboard() {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">لوحة التحكم المالية</h1>
          <p className="text-muted-foreground">إدارة الميزانية والمصروفات والتقارير المالية</p>
        </div>
        
        <Tabs defaultValue="expenses">
          <TabsList className="mb-6">
            <TabsTrigger value="expenses">المصروفات</TabsTrigger>
            <TabsTrigger value="resources">الموارد</TabsTrigger>
            <TabsTrigger value="targets">الأهداف</TabsTrigger>
            <TabsTrigger value="reports">التقارير</TabsTrigger>
          </TabsList>
          
          <TabsContent value="expenses">
            <ExpensesTab />
          </TabsContent>
          
          <TabsContent value="resources">
            <ResourcesTab />
          </TabsContent>
          
          <TabsContent value="targets">
            <TargetsTab />
          </TabsContent>
          
          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}

export default FinanceDashboard;
