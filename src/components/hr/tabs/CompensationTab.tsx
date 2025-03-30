
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DollarSign } from "lucide-react";

export function CompensationTab() {
  const [activeTab, setActiveTab] = useState("salaries");
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">التعويضات والمزايا</h2>
        <Button>تحديث بيانات الرواتب</Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="salaries">الرواتب</TabsTrigger>
          <TabsTrigger value="benefits">المزايا</TabsTrigger>
          <TabsTrigger value="contracts">العقود</TabsTrigger>
        </TabsList>
        
        <TabsContent value="salaries" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-right">إدارة الرواتب</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-lg mb-2">سيتم هنا عرض بيانات الرواتب والمكافآت</p>
              <p className="text-sm text-muted-foreground">يمكنك إدارة الرواتب والعلاوات والمكافآت للموظفين</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="benefits" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-right">المزايا والتأمينات</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-lg mb-2">سيتم هنا عرض المزايا والتأمينات المقدمة للموظفين</p>
              <p className="text-sm text-muted-foreground">يمكنك إدارة برامج التأمين الصحي والمزايا الأخرى</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contracts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-right">إدارة العقود</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-lg mb-2">سيتم هنا عرض العقود والاتفاقيات مع الموظفين</p>
              <p className="text-sm text-muted-foreground">يمكنك إدارة العقود ومتابعة تواريخ انتهائها</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
