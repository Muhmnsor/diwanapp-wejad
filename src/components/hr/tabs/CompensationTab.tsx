
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export function CompensationTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">التعويضات والمزايا</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-right">إدارة التعويضات</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-lg mb-2">سيتم هنا عرض وإدارة التعويضات والمزايا</p>
          <p className="text-sm text-muted-foreground">يمكنك إدارة الرواتب والبدلات والمزايا الأخرى للموظفين</p>
        </CardContent>
      </Card>
    </div>
  );
}
