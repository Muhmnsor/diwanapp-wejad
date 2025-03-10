
import { Card } from "@/components/ui/card";

export const ResourcesTab = () => {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">الموارد المالية</h2>
        <p className="text-muted-foreground">لا توجد موارد مالية مسجلة حالياً.</p>
      </Card>
    </div>
  );
};
