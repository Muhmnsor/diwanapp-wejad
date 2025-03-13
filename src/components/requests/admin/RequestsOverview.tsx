
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRequestStatistics } from "../hooks/useRequestStatistics";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const RequestsOverview = () => {
  const { statistics, isLoading, error } = useRequestStatistics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-1/3 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
        
        <div className="col-span-1 md:col-span-2 lg:col-span-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <h2 className="text-xl font-semibold text-red-600 mb-2">حدث خطأ</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }
  
  if (!statistics) {
    return (
      <div className="p-6 bg-yellow-50 rounded-lg">
        <h2 className="text-xl font-semibold text-yellow-600 mb-2">لا توجد بيانات</h2>
        <p className="text-yellow-600">لم يتم العثور على إحصائيات للطلبات</p>
      </div>
    );
  }

  // Prepare status colors for pie chart
  const STATUS_COLORS = {
    pending: "#f59e0b", // amber-500
    completed: "#10b981", // emerald-500
    rejected: "#ef4444", // red-500
    default: "#6b7280" // gray-500
  };

  const getStatusColor = (status: string) => {
    return (STATUS_COLORS as any)[status] || STATUS_COLORS.default;
  };
  
  // Format data for status chart
  const statusChartData = statistics.requestsByStatus.map(item => ({
    name: item.status === "pending" ? "قيد الانتظار" : 
          item.status === "completed" ? "مكتمل" : 
          item.status === "rejected" ? "مرفوض" : item.status,
    value: item.count,
    status: item.status
  }));
  
  // Format data for type chart
  const typeChartData = statistics.requestsByType.map(item => ({
    name: item.typeName,
    count: item.count
  }));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">إجمالي الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="h-5 w-5 ml-2 text-primary" />
              <p className="text-2xl font-bold">{statistics.totalRequests}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">قيد الانتظار</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-5 w-5 ml-2 text-amber-500" />
              <p className="text-2xl font-bold">{statistics.pendingRequests}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">تمت الموافقة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 ml-2 text-emerald-500" />
              <p className="text-2xl font-bold">{statistics.approvedRequests}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">مرفوضة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <XCircle className="h-5 w-5 ml-2 text-red-500" />
              <p className="text-2xl font-bold">{statistics.rejectedRequests}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع الطلبات حسب الحالة</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} طلب`, ""]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Request Types */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع الطلبات حسب النوع</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={typeChartData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip formatter={(value) => [`${value} طلب`, ""]} />
                <Bar dataKey="count" fill="#8884d8" barSize={20} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
