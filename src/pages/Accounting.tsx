
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Book, Receipt, PieChart, Landmark } from "lucide-react";
import { useState } from "react";
import { AccountingDashboard } from "@/components/accounting/AccountingDashboard";
import { ChartOfAccounts } from "@/components/accounting/ChartOfAccounts";
import { JournalEntries } from "@/components/accounting/JournalEntries";
import { FinancialReports } from "@/components/accounting/FinancialReports";

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
          <TabsList className="grid grid-cols-5 w-full mb-8">
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
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>التقارير</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Landmark className="h-4 w-4" />
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

          <TabsContent value="reports" className="space-y-4">
            <FinancialReports />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-right">إعدادات النظام المحاسبي</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-right">إعدادات النظام المحاسبي ستكون متاحة قريبًا...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Accounting;
