
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const DashboardTab = () => {
  return (
    <Card className="rtl text-right">
      <CardHeader>
        <CardTitle>لوحة معلومات الاجتماعات</CardTitle>
        <CardDescription>عرض إحصائيات ومعلومات الاجتماعات</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <p className="text-muted-foreground">المحتوى قيد التطوير</p>
        </div>
      </CardContent>
    </Card>
  );
};
