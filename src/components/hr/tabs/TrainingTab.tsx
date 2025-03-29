
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export function TrainingTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">التدريب والتطوير</h2>
        <Button>إضافة برنامج تدريبي</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-right">البرامج التدريبية</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-lg mb-2">سيتم هنا عرض برامج التدريب والتطوير</p>
          <p className="text-sm text-muted-foreground">يمكنك إضافة ومتابعة برامج التدريب والتطوير للموظفين</p>
        </CardContent>
      </Card>
    </div>
  );
}
