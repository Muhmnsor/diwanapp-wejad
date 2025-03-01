
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, BarChart, PieChart } from "lucide-react";

export const ReportsTab = () => {
  const [activeReportTab, setActiveReportTab] = useState("summary");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">التقارير المالية</h2>
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span>تصدير التقرير</span>
        </Button>
      </div>

      <Tabs
        value={activeReportTab}
        onValueChange={setActiveReportTab}
        className="w-full"
        dir="rtl"
      >
        <TabsList className="w-full grid grid-cols-4 mb-4">
          <TabsTrigger value="summary">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>ملخص مالي</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="resources">
            <div className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span>تقرير الموارد</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="expenses">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              <span>تقرير المصروفات</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="comparison">
            <div className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span>مقارنة سنوية</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الملخص المالي - 2023</CardTitle>
              <CardDescription>نظرة عامة على الوضع المالي للسنة الحالية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">ملخص الموارد والمصروفات</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">إجمالي الموارد:</span>
                      <span className="font-medium">1,250,000 ريال</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">إجمالي المصروفات:</span>
                      <span className="font-medium">850,000 ريال</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الرصيد الحالي:</span>
                      <span className="font-medium text-green-600">400,000 ريال</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">تحقيق المستهدفات</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">مستهدف الموارد:</span>
                      <span className="font-medium">1,500,000 ريال</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">نسبة التحقق:</span>
                      <span className="font-medium text-yellow-600">83%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">المتبقي للتحقيق:</span>
                      <span className="font-medium">250,000 ريال</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-muted-foreground">يمكن هنا إضافة رسومات بيانية تفصيلية لتوضيح البيانات المالية</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تقرير الموارد المالية</CardTitle>
              <CardDescription>تفاصيل الموارد المالية حسب المصدر والفترة</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-10 text-muted-foreground">
                هنا يمكن عرض تقرير مفصل عن الموارد المالية مع إمكانية تصفيتها حسب المصدر والفترة الزمنية
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تقرير المصروفات</CardTitle>
              <CardDescription>تفاصيل المصروفات حسب بنود الميزانية والفترة</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-10 text-muted-foreground">
                هنا يمكن عرض تقرير مفصل عن المصروفات مع إمكانية تصفيتها حسب البند والفترة الزمنية
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تقرير المقارنة السنوية</CardTitle>
              <CardDescription>مقارنة بين السنوات المالية المختلفة</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-10 text-muted-foreground">
                هنا يمكن عرض تقرير مقارنة بين السنوات المالية المختلفة من حيث الموارد والمصروفات
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
