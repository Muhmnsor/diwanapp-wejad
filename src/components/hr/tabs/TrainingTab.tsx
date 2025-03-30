
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GraduationCap } from "lucide-react";

export function TrainingTab() {
  const [activeTab, setActiveTab] = useState("training");
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">التدريب والتطوير</h2>
        <Button>إضافة تدريب جديد</Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="training">البرامج التدريبية</TabsTrigger>
          <TabsTrigger value="development">خطط التطوير المهني</TabsTrigger>
        </TabsList>
        
        <TabsContent value="training" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-right">البرامج التدريبية</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-lg mb-2">سيتم هنا عرض البرامج التدريبية المتاحة</p>
              <p className="text-sm text-muted-foreground">يمكنك إضافة برامج تدريبية جديدة وإدارة التسجيل فيها</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="development" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-right">خطط التطوير المهني</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-lg mb-2">سيتم هنا عرض خطط التطوير المهني للموظفين</p>
              <p className="text-sm text-muted-foreground">يمكنك إنشاء وإدارة مسارات التطوير المهني للموظفين</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
