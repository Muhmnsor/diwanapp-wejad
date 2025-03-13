
import React from "react";
import { useRequestStatistics } from "../hooks/useRequestStatistics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertCircle, FileText, Clock, CheckCircle, XCircle, BarChart4 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from "recharts";

export const RequestsOverview = () => {
  const { statistics, isLoading, error, refreshStatistics } = useRequestStatistics();
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  const STATUS_COLORS: Record<string, string> = {
    pending: '#FFBB28',
    completed: '#00C49F',
    rejected: '#FF8042',
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>جاري تحميل الإحصائيات...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4 ml-2" />
        <AlertDescription>
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            className="mr-2 mt-2"
            onClick={() => refreshStatistics()}
          >
            إعادة المحاولة
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!statistics) {
    return (
      <div className="text-center py-8">
        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">لا توجد إحصائيات متاحة</h3>
        <p className="text-muted-foreground">لم يتم العثور على أي بيانات إحصائية للطلبات</p>
      </div>
    );
  }
  
  const pieChartData = statistics.requestsByStatus?.map(item => ({
    name: item.status === 'pending' ? 'قيد الانتظار' : 
          item.status === 'completed' ? 'مكتملة' : 
          item.status === 'rejected' ? 'مرفوضة' : item.status,
    value: item.count
  }));
  
  const barChartData = statistics.requestsByType?.map(item => ({
    name: item.typeName,
    count: item.count
  }));
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">لوحة معلومات الطلبات</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row justify-between items-center">
            <CardTitle className="text-lg text-muted-foreground">إجمالي الطلبات</CardTitle>
            <FileText className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statistics.totalRequests}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 flex flex-row justify-between items-center">
            <CardTitle className="text-lg text-muted-foreground">قيد الانتظار</CardTitle>
            <Clock className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">{statistics.pendingRequests}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 flex flex-row justify-between items-center">
            <CardTitle className="text-lg text-muted-foreground">مكتملة</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{statistics.approvedRequests}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 flex flex-row justify-between items-center">
            <CardTitle className="text-lg text-muted-foreground">مرفوضة</CardTitle>
            <XCircle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{statistics.rejectedRequests}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <Tabs defaultValue="status" className="w-full">
        <TabsList>
          <TabsTrigger value="status">
            <BarChart4 className="h-4 w-4 ml-2" />
            حسب الحالة
          </TabsTrigger>
          <TabsTrigger value="types">
            <BarChart4 className="h-4 w-4 ml-2" />
            حسب النوع
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>توزيع الطلبات حسب الحالة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      fill="#8884d8"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData?.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.name === 'قيد الانتظار' ? STATUS_COLORS.pending :
                            entry.name === 'مكتملة' ? STATUS_COLORS.completed :
                            entry.name === 'مرفوضة' ? STATUS_COLORS.rejected :
                            COLORS[index % COLORS.length]
                          } 
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} طلب`, 'العدد']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="types">
          <Card>
            <CardHeader>
              <CardTitle>توزيع الطلبات حسب النوع</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} طلب`, 'العدد']} />
                    <Legend />
                    <Bar dataKey="count" name="عدد الطلبات" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
