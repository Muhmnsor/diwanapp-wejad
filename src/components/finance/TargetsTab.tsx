
import { Card } from "@/components/ui/card";

export const TargetsTab = () => {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">الأهداف المالية</h2>
        <p className="text-muted-foreground">لا توجد أهداف مالية محددة حالياً.</p>
      </Card>
    </div>
  );
};
