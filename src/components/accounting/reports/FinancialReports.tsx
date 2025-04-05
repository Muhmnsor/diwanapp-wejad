
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { FileDown, FileText, Landmark, BarChartHorizontal, BookOpen, DollarSign } from "lucide-react";
import { BalanceSheet } from "./BalanceSheet";
import { IncomeStatement } from "./IncomeStatement";
import { GeneralLedger } from "../ledger/GeneralLedger";
import { TrialBalance } from "../trial-balance/TrialBalance";
import { CashFlowStatement } from "../cashflow/CashFlowStatement";

export const FinancialReports = () => {
  const [activeTab, setActiveTab] = useState("balance-sheet");

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">التقارير المالية</h2>
      </div>

      <Tabs
        defaultValue="balance-sheet"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
        dir="rtl"
      >
        <TabsList className="grid grid-cols-5 w-full mb-8">
          <TabsTrigger value="balance-sheet" className="flex items-center gap-2">
            <Landmark className="h-4 w-4" />
            <span>الميزانية العمومية</span>
          </TabsTrigger>
          <TabsTrigger value="income-statement" className="flex items-center gap-2">
            <BarChartHorizontal className="h-4 w-4" />
            <span>قائمة الدخل</span>
          </TabsTrigger>
          <TabsTrigger value="cash-flow" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span>التدفقات النقدية</span>
          </TabsTrigger>
          <TabsTrigger value="general-ledger" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>دفتر الأستاذ</span>
          </TabsTrigger>
          <TabsTrigger value="trial-balance" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>ميزان المراجعة</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="balance-sheet" className="space-y-4">
          <BalanceSheet />
        </TabsContent>

        <TabsContent value="income-statement" className="space-y-4">
          <IncomeStatement />
        </TabsContent>

        <TabsContent value="cash-flow" className="space-y-4">
          <CashFlowStatement />
        </TabsContent>

        <TabsContent value="general-ledger" className="space-y-4">
          <GeneralLedger />
        </TabsContent>

        <TabsContent value="trial-balance" className="space-y-4">
          <TrialBalance />
        </TabsContent>
      </Tabs>
    </>
  );
};
