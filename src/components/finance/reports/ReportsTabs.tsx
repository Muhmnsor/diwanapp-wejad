
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, FileText, PieChart } from "lucide-react";
import { ResourcesReportCard } from "./ResourcesReportCard";
import { ExpensesReportCard } from "./ExpensesReportCard";
import { ComparisonReportCard } from "./ComparisonReportCard";
import { FinancialSummaryCard } from "./FinancialSummaryCard";
import { TargetsComparisonChart } from "./TargetsComparisonChart";

interface ReportsTabsProps {
  activeReportTab: string;
  setActiveReportTab: (value: string) => void;
  financialData: {
    totalResources: number;
    totalExpenses: number;
    resourcesTarget: number;
    resourcesPercentage: number;
    resourcesRemaining: number;
    currentYear: number;
  };
  loading: boolean;
  comparisonData: any[];
  formatCurrency: (num: number) => string;
}

export const ReportsTabs: React.FC<ReportsTabsProps> = ({
  activeReportTab,
  setActiveReportTab,
  financialData,
  loading,
  comparisonData,
  formatCurrency,
}) => {
  return (
    <Tabs
      value={activeReportTab}
      onValueChange={setActiveReportTab}
      className="w-full"
      dir="rtl"
    >
      <TabsList className="w-full grid grid-cols-4 mb-4">
        <TabsTrigger value="summary">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>ملخص مالي</span>
          </div>
        </TabsTrigger>
        <TabsTrigger value="resources">
          <div className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>تقرير الموارد</span>
          </div>
        </TabsTrigger>
        <TabsTrigger value="expenses">
          <div className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            <span>تقرير المصروفات</span>
          </div>
        </TabsTrigger>
        <TabsTrigger value="comparison">
          <div className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>مقارنة سنوية</span>
          </div>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="summary" className="space-y-4">
        <FinancialSummaryCard
          financialData={financialData}
          loading={loading}
          formatCurrency={formatCurrency}
        />
        <div className="mt-8">
          <TargetsComparisonChart data={comparisonData} loading={loading} />
        </div>
      </TabsContent>

      <TabsContent value="resources" className="space-y-4">
        <ResourcesReportCard />
      </TabsContent>

      <TabsContent value="expenses" className="space-y-4">
        <ExpensesReportCard />
      </TabsContent>

      <TabsContent value="comparison" className="space-y-4">
        <ComparisonReportCard comparisonData={comparisonData} loading={loading} />
      </TabsContent>
    </Tabs>
  );
};
