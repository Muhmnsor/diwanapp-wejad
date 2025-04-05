
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Book, Receipt, PieChart, Landmark, Settings, DollarSign, BarChartHorizontal } from "lucide-react";
import { useState } from "react";
import { AccountingDashboard } from "@/components/accounting/AccountingDashboard";
import { ChartOfAccounts } from "@/components/accounting/ChartOfAccounts";
import { JournalEntries } from "@/components/accounting/JournalEntries";
import { FinancialReports } from "@/components/accounting/reports/FinancialReports";
import { CostCenters } from "@/components/accounting/cost-centers/CostCenters";
import { AccountingPeriods } from "@/components/accounting/periods/AccountingPeriods";
import { OpeningBalances } from "@/components/accounting/opening-balances/OpeningBalances";

const Accounting = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary text-right my-[13px]">نظام المحاسبة</h1>
          <p className="text-muted-foreground text-right">إدارة العمليات المحاسبية بكفاءة</p>
        </div>

        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
          <TabsList className="grid grid-cols-7 w-full mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              <span>نظرة عامة</span>
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              <span>شجرة الحسابات</span>
            </TabsTrigger>
            <TabsTrigger value="journal" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span>القيود المحاسبية</span>
            </TabsTrigger>
            <TabsTrigger value="cost-centers" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>مراكز التكلفة</span>
            </TabsTrigger>
            <TabsTrigger value="periods" className="flex items-center gap-2">
              <BarChartHorizontal className="h-4 w-4" />
              <span>الفترات المحاسبية</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>التقارير</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>الإعدادات</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <AccountingDashboard />
          </TabsContent>

          <TabsContent value="accounts" className="space-y-4">
            <ChartOfAccounts />
          </TabsContent>

          <TabsContent value="journal" className="space-y-4">
            <JournalEntries />
          </TabsContent>
          
          <TabsContent value="cost-centers" className="space-y-4">
            <CostCenters />
          </TabsContent>
          
          <TabsContent value="periods" className="space-y-4">
            <AccountingPeriods />
            <OpeningBalances />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <FinancialReports />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium mb-4">الإعدادات العامة</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  إعدادات النظام المحاسبي الأساسية
                </p>
                <div className="space-y-4 text-right">
                  <div>
                    <h4 className="font-medium">العملة الأساسية</h4>
                    <p className="text-sm text-muted-foreground">ريال سعودي (SAR)</p>
                  </div>
                  <div>
                    <h4 className="font-medium">السنة المالية</h4>
                    <p className="text-sm text-muted-foreground">من 1 يناير إلى 31 ديسمبر</p>
                  </div>
                  <div>
                    <h4 className="font-medium">نظام الترقيم</h4>
                    <p className="text-sm text-muted-foreground">تسلسلي سنوي</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium mb-4">تنزيل البيانات</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  تصدير البيانات المحاسبية لاستخدامها خارج النظام
                </p>
                <div className="flex flex-col space-y-2">
                  <button className="p-2 border rounded hover:bg-gray-50 text-right flex justify-between items-center">
                    <span className="text-sm">تصدير بيانات الحسابات</span>
                    <FileText className="h-4 w-4" />
                  </button>
                  <button className="p-2 border rounded hover:bg-gray-50 text-right flex justify-between items-center">
                    <span className="text-sm">تصدير قائمة القيود المحاسبية</span>
                    <FileText className="h-4 w-4" />
                  </button>
                  <button className="p-2 border rounded hover:bg-gray-50 text-right flex justify-between items-center">
                    <span className="text-sm">تصدير التقارير المالية</span>
                    <FileText className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Accounting;
