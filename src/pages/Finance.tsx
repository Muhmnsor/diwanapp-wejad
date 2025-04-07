import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart, 
  BarChart, 
  Wallet, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  DollarSign, 
  Target, 
  FileText, 
  FileCheck,
  Receipt 
} from "lucide-react";
import { useState } from "react";
import { FinanceDashboard } from "@/components/finance/FinanceDashboard";
import { ResourcesTab } from "@/components/finance/ResourcesTab";
import { ExpensesTab } from "@/components/finance/ExpensesTab";
import { TargetsTab } from "@/components/finance/TargetsTab";
import { ReportsTab } from "@/components/finance/ReportsTab";
import { ObligationsTab } from "@/components/finance/obligations/ObligationsTab";
import { ReceiptsTab } from "@/components/finance/receipts/ReceiptsTab";
import { InvoicesVouchersTab } from "@/components/finance/invoices-vouchers/InvoicesVouchersTab";

const Finance = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  return <div className="min-h-screen flex flex-col bg-gray-50">
      <TopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary text-right my-[13px]">نظام إدارة التقديرات</h1>
          <p className="text-muted-foreground text-right">تحكم في إدارة التقديرات بكفاءة</p>
        </div>

        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
          <TabsList className="grid grid-cols-8 w-full mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              <span>نظرة عامة</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4" />
              <span>الموارد</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <ArrowDownCircle className="h-4 w-4" />
              <span>المصروفات</span>
            </TabsTrigger>
            <TabsTrigger value="receipts" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span>سندات القبض</span>
            </TabsTrigger>
            <TabsTrigger value="invoices-vouchers" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>الفواتير والسندات</span>
            </TabsTrigger>
            <TabsTrigger value="obligations" className="flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              <span>الالتزامات</span>
            </TabsTrigger>
            <TabsTrigger value="targets" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>المستهدفات</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>التقارير</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <FinanceDashboard />
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <ResourcesTab />
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <ExpensesTab />
          </TabsContent>
          
          <TabsContent value="receipts" className="space-y-4">
            <ReceiptsTab />
          </TabsContent>
          
          <TabsContent value="invoices-vouchers" className="space-y-4">
            <InvoicesVouchersTab />
          </TabsContent>

          <TabsContent value="obligations" className="space-y-4">
            <ObligationsTab />
          </TabsContent>

          <TabsContent value="targets" className="space-y-4">
            <TargetsTab />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <ReportsTab />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>;
};
export default Finance;
