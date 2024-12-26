import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const NotificationSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>إعدادات التنبيهات</CardTitle>
        <CardDescription>
          إعدادات التنبيهات الخاصة بخدمة الواتساب
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          سيتم إضافة إعدادات التنبيهات في تحديث قادم
        </p>
      </CardContent>
    </Card>
  );
};