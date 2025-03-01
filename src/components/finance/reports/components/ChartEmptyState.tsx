
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ChartEmptyState = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>مقارنة المستهدفات والمصروفات</CardTitle>
      </CardHeader>
      <CardContent className="h-80 flex items-center justify-center">
        <p className="text-muted-foreground">لا توجد بيانات متاحة</p>
      </CardContent>
    </Card>
  );
};

