
import React from "react";
import { useRequestStatistics } from "../hooks/useRequestStatistics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const RequestsOverview = () => {
  const { statistics, isLoading, error, refreshStatistics } = useRequestStatistics();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">جاري تحميل الإحصائيات...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ في تحميل الإحصائيات</AlertTitle>
        <AlertDescription>
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={refreshStatistics}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            إعادة المحاولة
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!statistics) {
    return (
      <div className="text-center p-8">
        <p>لا توجد إحصائيات متاحة</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2" 
          onClick={refreshStatistics}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          تحديث
        </Button>
      </div>
    );
  }

  const getStatusTranslation = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'completed': return 'مكتمل';
      case 'rejected': return 'مرفوض';
      case 'in_progress': return 'قيد التنفيذ';
      default: return status;
    }
  };

  const statusChartData = statistics.requestsByStatus.map(item => ({
    name: getStatusTranslation(item.status),
    value: item.count
  }));

  const typeChartData = statistics.requestsByType.map(item => ({
    name: item.typeName,
    count: item.count
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalRequests}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">قيد الانتظار</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{statistics.pendingRequests}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">مكتملة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{statistics.approvedRequests}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">مرفوضة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{statistics.rejectedRequests}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>توزيع الطلبات حسب الحالة</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} طلب`, 'العدد']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full justify-center items-center text-muted-foreground">
                لا توجد بيانات كافية لعرض المخطط
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>توزيع الطلبات حسب النوع</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {typeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeChartData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fill: 'black' }} />
                  <Tooltip formatter={(value) => [`${value} طلب`, 'العدد']} />
                  <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full justify-center items-center text-muted-foreground">
                لا توجد بيانات كافية لعرض المخطط
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
