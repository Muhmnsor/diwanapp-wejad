
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Wallet, TrendingUp, TrendingDown, DollarSign, ArrowDownUp, FileText } from "lucide-react";
import { BudgetItemsTable } from "./BudgetItemsTable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const FinanceDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalResources: 0,
    totalExpenses: 0,
    totalObligations: 0,
    totalCashFlow: 0,
    remainingBalance: 0,
    expensePercentage: 0,
    transactionsCount: { resources: 0, expenses: 0, obligations: 0 },
    remainingObligationsBalance: 0
  });
  const [pieData, setPieData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ name: string; الموارد: number; المصروفات: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ألوان ثابتة للرسم البياني الدائري
  const pieColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // 1. جلب إجمالي الموارد
      const { data: resourcesData, error: resourcesError } = await supabase
        .from('financial_resources')
        .select('net_amount, total_amount, obligations_amount, date');
      
      if (resourcesError) throw resourcesError;
      
      // 2. جلب إجمالي المصروفات
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('amount, date');
      
      if (expensesError) throw expensesError;
      
      // 3. جلب بيانات البنود
      const { data: budgetItemsData, error: budgetItemsError } = await supabase
        .from('budget_items')
        .select('id, name, default_percentage');
      
      if (budgetItemsError) throw budgetItemsError;
      
      // 4. جلب المصروفات حسب البند
      const { data: expensesByItemData, error: expensesByItemError } = await supabase
        .from('expenses')
        .select('budget_item_id, amount');
      
      if (expensesByItemError) throw expensesByItemError;
      
      // 5. جلب بيانات الالتزامات
      const { data: obligationsData, error: obligationsError } = await supabase
        .from('resource_obligations')
        .select('amount');
        
      if (obligationsError) throw obligationsError;
      
      // 6. جلب بيانات أرصدة الالتزامات
      const { data: obligationBalancesData, error: obligationBalancesError } = await supabase
        .from('obligation_balances_view')
        .select('original_amount, remaining_balance');
        
      if (obligationBalancesError) throw obligationBalancesError;
      
      // حساب المجاميع
      const totalResources = resourcesData.reduce((sum, resource) => sum + resource.net_amount, 0);
      const totalExpenses = expensesData.reduce((sum, expense) => sum + expense.amount, 0);
      const totalObligations = resourcesData.reduce((sum, resource) => sum + resource.obligations_amount, 0);
      const totalCashFlow = resourcesData.reduce((sum, resource) => sum + resource.total_amount, 0);
      const remainingBalance = totalResources - totalExpenses;
      const expensePercentage = totalResources > 0 ? Math.round((totalExpenses / totalResources) * 100) : 0;
      
      // حساب الرصيد المتبقي من الالتزامات
      const remainingObligationsBalance = obligationBalancesData?.reduce(
        (sum, balance) => sum + balance.remaining_balance, 
        0
      ) || 0;
      
      // إعداد بيانات الرسم البياني الدائري
      const pieChartData = budgetItemsData.map((item, index) => {
        // حساب إجمالي المصروفات لهذا البند
        const itemExpenses = expensesByItemData
          .filter(exp => exp.budget_item_id === item.id)
          .reduce((sum, exp) => sum + exp.amount, 0);
        
        // النسبة المئوية من إجمالي المصروفات
        const percentage = totalExpenses > 0 
          ? (itemExpenses / totalExpenses) * 100 
          : item.default_percentage;
        
        return {
          name: item.name,
          value: parseFloat(percentage.toFixed(1)),
          color: pieColors[index % pieColors.length]
        };
      });
      
      // إعداد بيانات الرسم البياني الشهري من البيانات الفعلية
      const monthlyChartData = generateMonthlyData(resourcesData, expensesData);
      
      setDashboardData({
        totalResources,
        totalExpenses,
        totalObligations,
        totalCashFlow,
        remainingBalance,
        expensePercentage,
        transactionsCount: {
          resources: resourcesData.length,
          expenses: expensesData.length,
          obligations: obligationsData.length
        },
        remainingObligationsBalance
      });
      
      setPieData(pieChartData);
      setMonthlyData(monthlyChartData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("حدث خطأ أثناء جلب بيانات لوحة المعلومات");
    } finally {
      setIsLoading(false);
    }
  };

  // دالة لإنشاء بيانات الشهور من البيانات الفعلية
  const generateMonthlyData = (resources: any[], expenses: any[]) => {
    // تحديد الأشهر العربية
    const months = ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    
    // إنشاء قاموس للبيانات الشهرية
    const monthlyData = months.map(month => ({
      name: month,
      الموارد: 0,
      المصروفات: 0
    }));

    // إضافة الموارد حسب الشهر
    resources.forEach(resource => {
      const date = new Date(resource.date);
      const monthIndex = date.getMonth();
      if (monthIndex >= 0 && monthIndex < 12) {
        monthlyData[monthIndex].الموارد += resource.net_amount;
      }
    });

    // إضافة المصروفات حسب الشهر
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthIndex = date.getMonth();
      if (monthIndex >= 0 && monthIndex < 12) {
        monthlyData[monthIndex].المصروفات += expense.amount;
      }
    });

    // تصفية الأشهر التي لها موارد أو مصروفات فقط للتركيز على البيانات المهمة
    const filteredData = monthlyData.filter(item => item.الموارد > 0 || item.المصروفات > 0);
    
    // إذا لم تكن هناك بيانات، نعرض الأشهر الستة الأولى بقيم صفرية
    return filteredData.length > 0 ? filteredData : monthlyData.slice(0, 6);
  };

  if (isLoading) {
    return <div className="text-center p-8">جاري تحميل البيانات...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* بطاقة إجمالي الموارد */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموارد</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalResources.toLocaleString()} ريال</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-4 w-4 ml-1 text-green-500" />
              عدد الموارد: {dashboardData.transactionsCount.resources}
            </p>
          </CardContent>
        </Card>

        {/* بطاقة إجمالي التدفقات (الموارد بالالتزامات) - البطاقة الجديدة الأولى */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التدفقات</CardTitle>
            <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalCashFlow.toLocaleString()} ريال</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-4 w-4 ml-1 text-blue-500" />
              الموارد مع الالتزامات
            </p>
          </CardContent>
        </Card>

        {/* بطاقة إجمالي الالتزامات - البطاقة الجديدة الثانية */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الالتزامات</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalObligations.toLocaleString()} ريال</div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                <TrendingDown className="inline h-4 w-4 ml-1 text-yellow-500" />
                عدد الالتزامات: {dashboardData.transactionsCount.obligations}
              </p>
              <p className="text-xs text-green-600 font-medium">
                المتبقي: {dashboardData.remainingObligationsBalance.toLocaleString()} ريال
              </p>
            </div>
          </CardContent>
        </Card>

        {/* بطاقة إجمالي المصروفات */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalExpenses.toLocaleString()} ريال</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline h-4 w-4 ml-1 text-red-500" />
              {dashboardData.expensePercentage}% من إجمالي الموارد
            </p>
          </CardContent>
        </Card>

        {/* بطاقة الرصيد المتبقي */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الرصيد المتبقي</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.remainingBalance.toLocaleString()} ريال</div>
            <p className="text-xs text-muted-foreground">
              {100 - dashboardData.expensePercentage}% من إجمالي الموارد
            </p>
          </CardContent>
        </Card>

        {/* بطاقة أرقام إضافية */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عدد المعاملات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.transactionsCount.resources + dashboardData.transactionsCount.expenses}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.transactionsCount.resources} موارد و {dashboardData.transactionsCount.expenses} مصروفات
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* توزيع البنود (رسم بياني دائري) */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>توزيع المصروفات على البنود</CardTitle>
            <CardDescription>النسب المئوية للصرف على البنود المختلفة</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* تدفق الأموال عبر الوقت (رسم بياني شريطي) */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>تدفق الأموال الشهري</CardTitle>
            <CardDescription>مقارنة بين الموارد والمصروفات شهريًا</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => `${value.toLocaleString()} ريال`}
                  labelFormatter={(label) => `شهر ${label}`}
                />
                <Legend />
                <Bar dataKey="الموارد" fill="#8884d8" name="الموارد" />
                <Bar dataKey="المصروفات" fill="#82ca9d" name="المصروفات" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* جدول البنود بأرصدتها الحالية */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>البنود والأرصدة الحالية</CardTitle>
          <CardDescription>حالة البنود المالية المختلفة</CardDescription>
        </CardHeader>
        <CardContent>
          <BudgetItemsTable />
        </CardContent>
      </Card>
    </div>
  );
};
