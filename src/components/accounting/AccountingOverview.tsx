
import React from "react";
import { useJournalEntryStats } from "@/hooks/accounting/useJournalEntryStats";
import { useAccountsSummary } from "@/hooks/accounting/useAccountsSummary";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ArrowUp, ArrowDown } from "lucide-react";
import { MonthlyComparisonChart } from "./dashboard/MonthlyComparisonChart";
import { LatestTransactionsCard } from "./dashboard/LatestTransactionsCard";

export const AccountingOverview = () => {
  const { totalTransactions, totalPostedAmount, totalDraftAmount, transactionsToday, isLoading: statsLoading } = useJournalEntryStats();
  const { assetTotal, liabilityTotal, equityTotal, netIncome, isLoading: accountsLoading } = useAccountsSummary();
  
  const isLoading = statsLoading || accountsLoading;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-right font-medium text-muted-foreground">
              إجمالي الأصول
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">
              {isLoading ? "جاري التحميل..." : formatCurrency(assetTotal)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-right font-medium text-muted-foreground">
              إجمالي الخصوم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">
              {isLoading ? "جاري التحميل..." : formatCurrency(liabilityTotal)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-right font-medium text-muted-foreground">
              إجمالي حقوق الملكية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">
              {isLoading ? "جاري التحميل..." : formatCurrency(equityTotal)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-right font-medium text-muted-foreground">
              صافي الدخل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">
              {isLoading ? "جاري التحميل..." : formatCurrency(netIncome)}
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <div className={`flex items-center ${netIncome > 0 ? 'text-green-500' : 'text-red-500'} text-xs`}>
              {netIncome > 0 ? <ArrowUp className="mr-1 h-4 w-4" /> : <ArrowDown className="mr-1 h-4 w-4" />}
              <span>
                {isLoading ? '' : netIncome > 0 ? 'زيادة في الأرباح' : 'نقص في الأرباح'}
              </span>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <MonthlyComparisonChart />
      
      <LatestTransactionsCard />
    </div>
  );
};
