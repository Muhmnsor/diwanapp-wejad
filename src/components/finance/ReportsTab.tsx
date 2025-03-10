
import { Card } from "@/components/ui/card";

export const ReportsTab = () => {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">التقارير المالية</h2>
        <p className="text-muted-foreground">لا توجد تقارير مالية متاحة حالياً.</p>
      </Card>
    </div>
  );
};
