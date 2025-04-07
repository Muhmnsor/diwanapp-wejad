
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3,
  DollarSign, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  CreditCard, 
  BarChartHorizontal 
} from "lucide-react";
import { LatestTransactionsCard } from "./dashboard/LatestTransactionsCard";
import { useAccountsSummary } from "@/hooks/accounting/useAccountsSummary";
import { useJournalEntryStats } from "@/hooks/accounting/useJournalEntryStats";
import { formatCurrency } from "@/lib/utils";
import { MonthlyComparisonChart } from "./charts/MonthlyComparisonChart";

export const AccountingOverview: React.FC = () => {
  const { 
    assetTotal, 
    liabilityTotal, 
    equityTotal, 
    revenueTotal,
    expenseTotal,
    netIncome,
    isLoading: isLoadingSummary
  } = useAccountsSummary();

  const { 
    totalTransactions, 
    totalPostedAmount, 
    totalDraftAmount,
    transactionsToday,
    isLoading: isLoadingStats
  } = useJournalEntryStats();
  
  const isLoading = isLoadingSummary || isLoadingStats;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأصول</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "جاري التحميل..." : formatCurrency(assetTotal)}
            </div>
            <p className="text-xs text-muted-foreground">إجمالي قيمة الأصول</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الخصوم</CardTitle>
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "جاري التحميل..." : formatCurrency(liabilityTotal)}
            </div>
            <p className="text-xs text-muted-foreground">إجمالي قيمة الخصوم</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">الإيرادات</CardTitle>
            <ArrowUpCircle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "جاري التحميل..." : formatCurrency(revenueTotal)}
            </div>
            <p className="text-xs text-muted-foreground">إجمالي الإيرادات</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">المصروفات</CardTitle>
            <ArrowDownCircle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "جاري التحميل..." : formatCurrency(expenseTotal)}
            </div>
            <p className="text-xs text-muted-foreground">إجمالي المصروفات</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">صافي الدخل</CardTitle>
            <BarChartHorizontal className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {isLoading ? "جاري التحميل..." : formatCurrency(netIncome)}
            </div>
            <p className="text-xs text-muted-foreground">الإيرادات - المصروفات</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">عدد المعاملات</CardTitle>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "جاري التحميل..." : totalTransactions}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "جاري التحميل..." : `${transactionsToday} معاملة اليوم`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">قيمة المعاملات المسجلة</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "جاري التحميل..." : formatCurrency(totalPostedAmount)}
            </div>
            <p className="text-xs text-muted-foreground">إجمالي قيمة المعاملات المعتمدة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">قيمة المعاملات المعلقة</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "جاري التحميل..." : formatCurrency(totalDraftAmount)}
            </div>
            <p className="text-xs text-muted-foreground">إجمالي قيمة المعاملات غير المعتمدة</p>
          </CardContent>
        </Card>
      </div>
      
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* All your existing cards... */}
    </div>
    
    {/* Add the Monthly Comparison Chart here */}
    <MonthlyComparisonChart />
    
    <LatestTransactionsCard />
  </div>
      
      <LatestTransactionsCard />
    </div>
  );
};
