
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const ResourcesReportCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>تقرير الموارد المالية</CardTitle>
        <CardDescription>تفاصيل الموارد المالية حسب المصدر والفترة</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center py-10 text-muted-foreground">
          هنا يمكن عرض تقرير مفصل عن الموارد المالية مع إمكانية تصفيتها حسب المصدر والفترة الزمنية
        </p>
      </CardContent>
    </Card>
  );
};
