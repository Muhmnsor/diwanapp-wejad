
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar } from "lucide-react";

export function AttendanceTab() {
  const [activeTab, setActiveTab] = useState("attendance");
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">الحضور والإجازات</h2>
        <Button>تسجيل حضور جديد</Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="attendance">سجلات الحضور</TabsTrigger>
          <TabsTrigger value="leaves">طلبات الإجازات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="attendance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-right">سجلات الحضور</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-lg mb-2">سيتم هنا عرض سجلات الحضور وتفاصيلها</p>
              <p className="text-sm text-muted-foreground">يمكنك تسجيل الحضور والانصراف والتقارير اليومية</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="leaves" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-right">طلبات الإجازات</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-lg mb-2">سيتم هنا عرض وإدارة طلبات الإجازات</p>
              <p className="text-sm text-muted-foreground">يمكنك رؤية الطلبات الجديدة والموافقة عليها ومتابعة حالتها</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
