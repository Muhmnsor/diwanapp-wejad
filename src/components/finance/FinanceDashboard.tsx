
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
import { Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { BudgetItemsTable } from "./BudgetItemsTable";

// بيانات تجريبية للرسوم البيانية - سيتم استبدالها بالبيانات الفعلية لاحقًا
const pieData = [
  { name: "الرواتب", value: 15.5, color: "#8884d8" },
  { name: "التشغيل", value: 11.3, color: "#82ca9d" },
  { name: "العقود", value: 25.9, color: "#ffc658" },
  { name: "التسويق", value: 8.4, color: "#ff8042" },
  { name: "تنفيذ البرامج", value: 39, color: "#0088fe" },
];

const monthlyData = [
  { name: "يناير", الموارد: 400000, المصروفات: 240000 },
  { name: "فبراير", الموارد: 300000, المصروفات: 200000 },
  { name: "مارس", الموارد: 500000, المصروفات: 300000 },
  { name: "أبريل", الموارد: 280000, المصروفات: 220000 },
  { name: "مايو", الموارد: 390000, المصروفات: 250000 },
  { name: "يونيو", الموارد: 490000, المصروفات: 270000 },
];

export const FinanceDashboard = () => {
  // بيانات اجمالية تجريبية - ستكون مرتبطة بقاعدة البيانات لاحقًا
  const totalResources = 2360000;
  const totalExpenses = 1480000;
  const remainingBalance = totalResources - totalExpenses;
  const expensePercentage = Math.round((totalExpenses / totalResources) * 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* بطاقة إجمالي الموارد */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموارد</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResources.toLocaleString()} ريال</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-4 w-4 ml-1 text-green-500" />
              زيادة 10% من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        {/* بطاقة إجمالي المصروفات */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExpenses.toLocaleString()} ريال</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline h-4 w-4 ml-1 text-red-500" />
              {expensePercentage}% من إجمالي الموارد
            </p>
          </CardContent>
        </Card>

        {/* بطاقة الرصيد المتبقي */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الرصيد المتبقي</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{remainingBalance.toLocaleString()} ريال</div>
            <p className="text-xs text-muted-foreground">
              {100 - expensePercentage}% من إجمالي الموارد
            </p>
          </CardContent>
        </Card>

        {/* بطاقة أرقام إضافية */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عدد المعاملات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">
              12 موارد و 20 مصروفات
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

        {/* تدفق الأموال عبر الوقت (رسم بياني خطي/شريطي) */}
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
