
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart, 
  BarChart, 
  Wallet, 
  Receipt, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  DollarSign, 
  FileText, 
  Landmark,
  BookOpen,
  LayoutList,
  Clock
} from "lucide-react";
import { useState } from "react";
import { AccountingDashboard } from "@/components/accounting/AccountingDashboard";
import { Invoices } from "@/components/accounting/invoices/Invoices";
import { Receipts } from "@/components/accounting/receipts/Receipts";
import { Vouchers } from "@/components/accounting/vouchers/Vouchers";
import { JournalEntries } from "@/components/accounting/JournalEntries";
import { FinancialReports } from "@/components/accounting/reports/FinancialReports";
import { CostCenters } from "@/components/accounting/cost-centers/CostCenters";
import { AccountingPeriods } from "@/components/accounting/periods/AccountingPeriods";

const Accounting = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return <div className="min-h-screen flex flex-col bg-gray-50">
      <TopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary text-right my-[13px]">نظام إدارة الحسابات</h1>
          <p className="text-muted-foreground text-right">تحكم في إدارة الحسابات وتتبع المعاملات المالية</p>
        </div>

        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
          <TabsList className="grid grid-cols-9 w-full mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              <span>نظرة عامة</span>
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span>الفواتير</span>
            </TabsTrigger>
            <TabsTrigger value="receipts" className="flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4" />
              <span>سندات القبض</span>
            </TabsTrigger>
            <TabsTrigger value="vouchers" className="flex items-center gap-2">
              <ArrowDownCircle className="h-4 w-4" />
              <span>سندات الصرف</span>
            </TabsTrigger>
            <TabsTrigger value="journal" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>القيود اليومية</span>
            </TabsTrigger>
            <TabsTrigger value="chart-of-accounts" className="flex items-center gap-2">
              <LayoutList className="h-4 w-4" />
              <span>شجرة الحسابات</span>
            </TabsTrigger>
            <TabsTrigger value="cost-centers" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span>مراكز التكلفة</span>
            </TabsTrigger>
            <TabsTrigger value="accounting-periods" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>الفترات المحاسبية</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span>التقارير المالية</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <AccountingDashboard />
          </TabsContent>

          <TabsContent value="invoices" className="space-y-4">
            <Invoices />
          </TabsContent>

          <TabsContent value="receipts" className="space-y-4">
            <Receipts />
          </TabsContent>

          <TabsContent value="vouchers" className="space-y-4">
            <Vouchers />
          </TabsContent>

          <TabsContent value="journal" className="space-y-4">
            <JournalEntries />
          </TabsContent>

          <TabsContent value="chart-of-accounts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-right">شجرة الحسابات</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-10">
                <p>سيتم إضافة شجرة الحسابات قريبًا</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cost-centers" className="space-y-4">
            <CostCenters />
          </TabsContent>

          <TabsContent value="accounting-periods" className="space-y-4">
            <AccountingPeriods />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <FinancialReports />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>;
};

export default Accounting;
