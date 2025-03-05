
import { Card } from "@/components/ui/card";

export const TasksReports = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">تقارير المهام والمشاريع</h2>
        <p className="text-muted-foreground">
          سيتم هنا عرض تقارير المشاريع والمهام الشخصية للمستخدم والتقارير العامة.
        </p>
        <div className="mt-8 p-8 text-center border border-dashed rounded-lg">
          <p className="text-muted-foreground">قريبًا سيتم إضافة محتوى تقارير المهام...</p>
        </div>
      </Card>
    </div>
  );
};
