
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export const WelcomeCard = () => {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-2xl font-bold">نظام إدارة الطلبات والاعتمادات</CardTitle>
        <FileText className="h-8 w-8 text-primary" />
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">الرجاء تسجيل الدخول للوصول إلى نظام الطلبات</h3>
          <p className="text-muted-foreground max-w-md">
            عليك تسجيل الدخول أولاً للتمكن من استخدام نظام إدارة الطلبات والاعتمادات.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
