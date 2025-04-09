
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, FileText, Download, Calendar, Filter } from "lucide-react";
import { useCorrespondence } from "@/hooks/useCorrespondence";
import { DateRangePicker } from './DateRangePicker'; // يجب إنشاء هذا المكون منفصلاً

export const ReportsTab = () => {
  const [activeTab, setActiveTab] = useState("statistics");
  const [reportType, setReportType] = useState<string>("summary");
  const [dateRange, setDateRange] = useState<{from: Date | undefined, to: Date | undefined}>({
    from: undefined,
    to: undefined,
  });
  const [loading, setLoading] = useState(false);
  const { getCorrespondenceReport } = useCorrespondence();

  const handleExportReport = async () => {
    setLoading(true);
    try {
      await getCorrespondenceReport(
        reportType,
        dateRange.from?.toISOString(),
        dateRange.to?.toISOString()
      );
      
      // هنا سيتم إنشاء وتنزيل التقرير
      
    } catch (error) {
      console.error("Error exporting report:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <TabsList>
          <TabsTrigger value="statistics" className="flex items-center">
            <BarChart3 className="w-4 h-4 ml-2" />
            الإحصائيات
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center">
            <FileText className="w-4 h-4 ml-2" />
            التقارير
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="statistics" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            title="إجمالي المعاملات" 
            value="120" 
            description="في الفترة الحالية" 
            change="+12%" 
            direction="up" 
          />
          <StatCard 
            title="المعاملات المكتملة" 
            value="85" 
            description="70% من الإجمالي" 
            change="+5%" 
            direction="up" 
          />
          <StatCard 
            title="معدل الاستجابة" 
            value="2.3 يوم" 
            description="متوسط وقت المعالجة" 
            change="-8%" 
            direction="down" 
            positive
          />
          <StatCard 
            title="المعاملات المتأخرة" 
            value="10" 
            description="8% من الإجمالي" 
            change="+2%" 
            direction="up" 
            positive={false}
          />
          <StatCard 
            title="الوارد" 
            value="65" 
            description="54% من الإجمالي" 
            change="+10%" 
            direction="up" 
          />
          <StatCard 
            title="الصادر" 
            value="55" 
            description="46% من الإجمالي" 
            change="+15%" 
            direction="up" 
          />
        </div>
        
        {/* Charts could be added here */}
        <Card className="p-4">
          <CardHeader>
            <CardTitle>التوزيع الشهري للمعاملات</CardTitle>
            <CardDescription>مخطط يوضح توزيع المعاملات على مدار الأشهر</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-muted rounded-md">
            <p className="text-muted-foreground">هنا سيتم عرض الرسم البياني للتوزيع الشهري للمعاملات</p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="reports" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>إنشاء تقرير</CardTitle>
            <CardDescription>
              اختر نوع التقرير والفترة الزمنية
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="report-type">نوع التقرير</Label>
                <Select
                  value={reportType}
                  onValueChange={setReportType}
                >
                  <SelectTrigger id="report-type">
                    <SelectValue placeholder="اختر نوع التقرير" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">تقرير ملخص</SelectItem>
                    <SelectItem value="detailed">تقرير تفصيلي</SelectItem>
                    <SelectItem value="status">تقرير حالة المعاملات</SelectItem>
                    <SelectItem value="performance">تقرير الأداء</SelectItem>
                    <SelectItem value="distribution">تقرير التوزيع</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>الفترة الزمنية</Label>
                <DateRangePicker
                  from={dateRange.from}
                  to={dateRange.to}
                  onSelect={setDateRange}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="report-title">عنوان التقرير</Label>
              <Input
                id="report-title"
                placeholder="أدخل عنوان التقرير"
              />
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <Filter className="w-4 h-4" />
              <Label>خيارات التصفية الإضافية</Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="report-status">الحالة</Label>
                <Select defaultValue="">
                  <SelectTrigger id="report-status">
                    <SelectValue placeholder="كل الحالات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">كل الحالات</SelectItem>
                    <SelectItem value="pending">قيد المعالجة</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="archived">مؤرشف</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="report-type-filter">النوع</Label>
                <Select defaultValue="">
                  <SelectTrigger id="report-type-filter">
                    <SelectValue placeholder="كل الأنواع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">كل الأنواع</SelectItem>
                    <SelectItem value="incoming">وارد</SelectItem>
                    <SelectItem value="outgoing">صادر</SelectItem>
                    <SelectItem value="letter">خطاب</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="report-priority">الأولوية</Label>
                <Select defaultValue="">
                  <SelectTrigger id="report-priority">
                    <SelectValue placeholder="كل الأولويات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">كل الأولويات</SelectItem>
                    <SelectItem value="high">عاجل</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="low">عادي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline">إعادة تعيين</Button>
            <Button 
              onClick={handleExportReport} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? 'جاري إنشاء التقرير...' : (
                <>
                  <Download className="w-4 h-4" />
                  إنشاء التقرير
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>التقارير المحفوظة</CardTitle>
            <CardDescription>
              تقارير تم إنشاؤها وحفظها مسبقاً
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-2">
              {/* Here we would map through saved reports */}
              <p className="text-center text-muted-foreground py-8">
                لا توجد تقارير محفوظة
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

// مكون فرعي لعرض إحصائية
interface StatCardProps {
  title: string;
  value: string;
  description: string;
  change: string;
  direction: 'up' | 'down';
  positive?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  change,
  direction,
  positive = true
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </CardContent>
      <CardFooter>
        <div className={`text-sm flex items-center ${(direction === 'up' && positive) || (direction === 'down' && !positive) ? 'text-green-600' : 'text-red-600'}`}>
          {direction === 'up' ? '↑' : '↓'} {change}
        </div>
      </CardFooter>
    </Card>
  );
};

