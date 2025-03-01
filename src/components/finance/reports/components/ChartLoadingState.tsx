
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ChartLoadingState = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>مقارنة المستهدفات والمصروفات</CardTitle>
      </CardHeader>
      <CardContent className="h-80 flex items-center justify-center">
        <p className="text-muted-foreground">جاري تحميل البيانات...</p>
      </CardContent>
    </Card>
  );
};

