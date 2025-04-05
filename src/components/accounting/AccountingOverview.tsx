
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccountsSummary } from "@/hooks/accounting/useAccountsSummary";
import { formatCurrency } from "@/lib/utils";
import { MonthlyComparisonChart } from "./dashboard/MonthlyComparisonChart";
import { LatestTransactionsCard } from "./dashboard/LatestTransactionsCard";
import { ArrowUpRight, ArrowDownRight, CircleDollarSign, Landmark, CircleAlert } from "lucide-react";

export const AccountingOverview = () => {
  const {
    assetTotal,
    liabilityTotal,
    equityTotal,
    revenueTotal,
    expenseTotal,
    netIncome,
    isLoading,
    error
  } = useAccountsSummary();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-right">
              الإيرادات
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">
              {isLoading ? "..." : formatCurrency(revenueTotal)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-right">
              المصروفات
            </CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">
              {isLoading ? "..." : formatCurrency(expenseTotal)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-right">
              صافي الدخل
            </CardTitle>
            <CircleDollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold text-right ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {isLoading ? "..." : formatCurrency(netIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-right">
              الأصول
            </CardTitle>
            <Landmark className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">
              {isLoading ? "..." : formatCurrency(assetTotal)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-right">
              الالتزامات
            </CardTitle>
            <CircleAlert className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-right">
              {isLoading ? "..." : formatCurrency(liabilityTotal)}
            </div>
          </CardContent>
        </Card>
      </div>

      <MonthlyComparisonChart />
      
      <LatestTransactionsCard />
    </div>
  );
};
