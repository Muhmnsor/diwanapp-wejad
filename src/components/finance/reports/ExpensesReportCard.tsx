
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const ExpensesReportCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>تقرير المصروفات</CardTitle>
        <CardDescription>تفاصيل المصروفات حسب بنود الميزانية والفترة</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center py-10 text-muted-foreground">
          هنا يمكن عرض تقرير مفصل عن المصروفات مع إمكانية تصفيتها حسب البند والفترة الزمنية
        </p>
      </CardContent>
    </Card>
  );
};
