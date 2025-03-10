
import { Card } from "@/components/ui/card";

export const ExpensesTab = () => {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">المصروفات</h2>
        <p className="text-muted-foreground">لا توجد مصروفات مسجلة حالياً.</p>
      </Card>
    </div>
  );
};
