import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const SecuritySettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>إعدادات الأمان</CardTitle>
        <CardDescription>
          إعدادات الأمان الخاصة بالربط مع خدمة الواتساب
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          سيتم إضافة إعدادات الأمان في تحديث قادم
        </p>
      </CardContent>
    </Card>
  );
};