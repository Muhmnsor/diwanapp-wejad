
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart } from "lucide-react";

export function ReportsTab() {
  const [activeTab, setActiveTab] = useState("attendance");
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">التقارير والإحصائيات</h2>
        <Button>تصدير التقارير</Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="attendance">تقارير الحضور</TabsTrigger>
          <TabsTrigger value="performance">تقارير الأداء</TabsTrigger>
          <TabsTrigger value="training">تقارير التدريب</TabsTrigger>
          <TabsTrigger value="turnover">تقارير دوران الموظفين</TabsTrigger>
        </TabsList>
        
        <TabsContent value="attendance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-right">تقارير الحضور والإجازات</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <BarChart className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-lg mb-2">سيتم هنا عرض إحصائيات وتقارير الحضور</p>
              <p className="text-sm text-muted-foreground">يمكنك إنشاء تقارير تفصيلية عن معدلات الحضور والغياب</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-right">تقارير تقييم الأداء</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <BarChart className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-lg mb-2">سيتم هنا عرض تقارير تقييم أداء الموظفين</p>
              <p className="text-sm text-muted-foreground">يمكنك متابعة مستويات الأداء ومقارنتها بالأهداف</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="training" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-right">تقارير التدريب</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <BarChart className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-lg mb-2">سيتم هنا عرض تقارير البرامج التدريبية</p>
              <p className="text-sm text-muted-foreground">يمكنك متابعة حضور الموظفين للدورات التدريبية وتقييمها</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="turnover" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-right">تقارير دوران الموظفين</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <BarChart className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-lg mb-2">سيتم هنا عرض تقارير التوظيف وترك العمل</p>
              <p className="text-sm text-muted-foreground">يمكنك متابعة معدلات التوظيف وترك العمل والاستقالات</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
