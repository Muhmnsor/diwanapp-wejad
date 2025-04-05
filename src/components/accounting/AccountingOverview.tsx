
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useBalanceSheet } from "@/hooks/accounting/useBalanceSheet";
import { useIncomeStatement } from "@/hooks/accounting/useIncomeStatement";
import { useJournalEntries } from "@/hooks/accounting/useJournalEntries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkline } from "@/components/ui/sparkline";
import { 
  DollarSign, ArrowDownCircle, ArrowUpCircle, BarChart4,
  Calendar, Filter, Download, RefreshCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccounts } from "@/hooks/accounting/useAccounts";
import { toast } from "@/components/ui/use-toast";

export const AccountingOverview = () => {
  // Date range state for filtering data
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().getFullYear(), 0, 1), // Start of current year
    to: new Date()
  });
  
  const [timeFrame, setTimeFrame] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  
  // Get all accounting data
  const { data: balanceSheetData, isLoading: bsLoading } = useBalanceSheet(dateRange.to);
  const { data: incomeData, isLoading: incomeLoading } = useIncomeStatement(dateRange.from, dateRange.to);
  const { entries: journalEntries, isLoading: jeLoading } = useJournalEntries();
  const { accounts, isLoading: accountsLoading } = useAccounts();
  
  // Calculate financial metrics
  const totalAssets = balanceSheetData?.totalAssets || 0;
  const totalLiabilities = balanceSheetData?.totalLiabilities || 0;
  const totalEquity = balanceSheetData?.totalEquity || 0;
  const totalRevenue = incomeData?.totalRevenues || 0;
  const totalExpenses = incomeData?.totalExpenses || 0;
  const netIncome = incomeData?.netIncome || 0;
  
  // Generate monthly revenue data for the sparkline chart
  const [revenueData, setRevenueData] = useState<number[]>([]);
  const [expenseData, setExpenseData] = useState<number[]>([]);
  const [profitData, setProfitData] = useState<number[]>([]);
  
  // Generate data for trend charts
  useEffect(() => {
    if (!journalEntries || journalEntries.length === 0) return;

    try {
      // Get revenue accounts
      const revenueAccountIds = accounts
        ?.filter(account => account.account_type === 'revenue')
        .map(account => account.id) || [];
        
      // Get expense accounts
      const expenseAccountIds = accounts
        ?.filter(account => account.account_type === 'expense')
        .map(account => account.id) || [];
      
      const calculateMonthlyValues = () => {
        const months = 12;
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        
        const monthlyRevenues: number[] = Array(months).fill(0);
        const monthlyExpenses: number[] = Array(months).fill(0);
        const monthlyProfits: number[] = Array(months).fill(0);
        
        // Process all journal entries
        journalEntries.forEach(entry => {
          // Skip entries not in the current year
          const entryDate = new Date(entry.date);
          if (entryDate.getFullYear() !== currentYear) return;
          
          const month = entryDate.getMonth();
          
          // Calculate monthly revenues and expenses
          entry.items.forEach(item => {
            if (revenueAccountIds.includes(item.account_id)) {
              // For revenue accounts, credit increases
              monthlyRevenues[month] += Number(item.credit_amount) - Number(item.debit_amount);
            }
            
            if (expenseAccountIds.includes(item.account_id)) {
              // For expense accounts, debit increases
              monthlyExpenses[month] += Number(item.debit_amount) - Number(item.credit_amount);
            }
          });
        });
        
        // Calculate profit for each month
        for (let i = 0; i < months; i++) {
          monthlyProfits[i] = monthlyRevenues[i] - monthlyExpenses[i];
        }
        
        // Set the states
        setRevenueData(monthlyRevenues);
        setExpenseData(monthlyExpenses);
        setProfitData(monthlyProfits);
      };
      
      calculateMonthlyValues();
    } catch (error) {
      console.error("Error calculating financial trends:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حساب الاتجاهات المالية",
        variant: "destructive"
      });
    }
  }, [journalEntries, accounts]);
  
  // Handle date range change
  const handleDateRangeChange = (type: 'from' | 'to', date: Date) => {
    setDateRange(prev => ({
      ...prev,
      [type]: date
    }));
  };
  
  const handleRefresh = () => {
    // This function would trigger a refetch of all financial data
    toast({
      title: "تحديث البيانات",
      description: "جاري تحديث البيانات المالية...",
    });
  };
  
  const isLoading = bsLoading || incomeLoading || jeLoading || accountsLoading;
  
  // Format number as currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Calculate percentage change (placeholder for now)
  const getPercentageChange = () => {
    return "+6%";
  };
  
  // Get most recent transactions
  const recentTransactions = journalEntries
    ?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5) || [];
  
  return (
    <div className="space-y-6">
      {/* Top filters and date range */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">نظرة عامة على المحاسبة</h2>
          <p className="text-muted-foreground">تحليل الوضع المالي الحالي والاتجاهات</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeFrame} onValueChange={(value: "monthly" | "quarterly" | "yearly") => setTimeFrame(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="الإطار الزمني" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">شهري</SelectItem>
              <SelectItem value="quarterly">ربع سنوي</SelectItem>
              <SelectItem value="yearly">سنوي</SelectItem>
            </SelectContent>
          </Select>
          
          <DateRangePicker
            from={dateRange.from}
            to={dateRange.to}
            onFromChange={(date) => handleDateRangeChange('from', date)}
            onToChange={(date) => handleDateRangeChange('to', date)}
          />
          
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Key financial metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأصول</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAssets)}</div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                {getPercentageChange()} من الشهر الماضي
              </p>
              <Sparkline className="h-8 w-20" data={revenueData} color="#4ade80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                {getPercentageChange()} من الشهر الماضي
              </p>
              <Sparkline className="h-8 w-20" data={revenueData} color="#4ade80" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                {getPercentageChange()} من الشهر الماضي
              </p>
              <Sparkline className="h-8 w-20" data={expenseData} color="#f87171" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صافي الدخل</CardTitle>
            <BarChart4 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(netIncome)}</div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                {getPercentageChange()} من الشهر الماضي
              </p>
              <Sparkline className="h-8 w-20" data={profitData} color="#60a5fa" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Financial charts and recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-right">تحليل الإيرادات والمصروفات</CardTitle>
            <CardDescription className="text-right">
              مقارنة بين الإيرادات والمصروفات خلال الفترة المحددة
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-72 flex items-center justify-center">
                <p>جاري تحميل البيانات...</p>
              </div>
            ) : revenueData.length === 0 ? (
              <div className="h-72 flex items-center justify-center">
                <p className="text-muted-foreground">
                  لا توجد بيانات كافية لعرض الرسم البياني
                </p>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center">
                <div className="w-full h-full">
                  {/* This is a placeholder for a more complex chart */}
                  <div className="grid grid-cols-12 h-full gap-1 items-end">
                    {revenueData.map((value, index) => {
                      const expense = expenseData[index] || 0;
                      const maxValue = Math.max(value, expense);
                      const revenueHeight = maxValue > 0 ? (value / maxValue) * 100 : 0;
                      const expenseHeight = maxValue > 0 ? (expense / maxValue) * 100 : 0;
                      
                      return (
                        <div key={index} className="col-span-1 h-full flex flex-col justify-end items-center">
                          <div className="w-full text-center text-xs text-muted-foreground mb-1">
                            {index + 1}
                          </div>
                          <div className="w-full flex justify-center gap-0.5">
                            <div 
                              className="w-1/3 bg-green-500 rounded-t"
                              style={{ height: `${revenueHeight}%` }}
                            ></div>
                            <div
                              className="w-1/3 bg-red-500 rounded-t"
                              style={{ height: `${expenseHeight}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-center mt-4 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span className="text-sm">الإيرادات</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span className="text-sm">المصروفات</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-right">أحدث المعاملات</CardTitle>
            <CardDescription className="text-right">
              آخر 5 قيود محاسبية تم تسجيلها
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <p>جاري تحميل البيانات...</p>
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="flex justify-center items-center py-10">
                <p className="text-muted-foreground">لا توجد معاملات حديثة</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div 
                    key={transaction.id}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div>
                      <p className="font-medium">{transaction.description.length > 25 ? 
                        `${transaction.description.substring(0, 25)}...` : 
                        transaction.description}
                      </p>
                      <p className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleDateString('ar-SA')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(transaction.total_amount || 0)}</p>
                      <p className={`text-xs ${transaction.status === 'posted' ? 'text-green-500' : 'text-amber-500'}`}>
                        {transaction.status === 'posted' ? 'مُرحل' : 'مسودة'}
                      </p>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-center pt-2">
                  <Button variant="outline" size="sm">
                    عرض جميع المعاملات
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Financial position snapshot */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">ملخص الوضع المالي</CardTitle>
          <CardDescription className="text-right">
            نظرة عامة على الأصول والالتزامات وحقوق الملكية
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="assets" className="w-full" dir="rtl">
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="assets">الأصول</TabsTrigger>
              <TabsTrigger value="liabilities">الالتزامات</TabsTrigger>
              <TabsTrigger value="equity">حقوق الملكية</TabsTrigger>
            </TabsList>
            
            <TabsContent value="assets">
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <p>جاري تحميل البيانات...</p>
                </div>
              ) : balanceSheetData?.assets.length === 0 ? (
                <div className="flex justify-center items-center py-10">
                  <p className="text-muted-foreground">لا توجد بيانات أصول متاحة</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {balanceSheetData?.assets.map((asset) => (
                    <div key={asset.id} className="flex justify-between items-center border-b pb-1">
                      <span>
                        {asset.code} - {asset.name}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(asset.balance)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 font-bold">
                    <span>الإجمالي</span>
                    <span>{formatCurrency(totalAssets)}</span>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="liabilities">
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <p>جاري تحميل البيانات...</p>
                </div>
              ) : balanceSheetData?.liabilities.length === 0 ? (
                <div className="flex justify-center items-center py-10">
                  <p className="text-muted-foreground">لا توجد بيانات التزامات متاحة</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {balanceSheetData?.liabilities.map((liability) => (
                    <div key={liability.id} className="flex justify-between items-center border-b pb-1">
                      <span>
                        {liability.code} - {liability.name}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(liability.balance)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 font-bold">
                    <span>الإجمالي</span>
                    <span>{formatCurrency(totalLiabilities)}</span>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="equity">
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <p>جاري تحميل البيانات...</p>
                </div>
              ) : balanceSheetData?.equity.length === 0 ? (
                <div className="flex justify-center items-center py-10">
                  <p className="text-muted-foreground">لا توجد بيانات حقوق ملكية متاحة</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {balanceSheetData?.equity.map((item) => (
                    <div key={item.id} className="flex justify-between items-center border-b pb-1">
                      <span>
                        {item.code} - {item.name}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(item.balance)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 font-bold">
                    <span>الإجمالي</span>
                    <span>{formatCurrency(totalEquity)}</span>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
