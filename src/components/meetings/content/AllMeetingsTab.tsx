
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const AllMeetingsTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>جميع الاجتماعات</CardTitle>
        <CardDescription>عرض وإدارة جميع الاجتماعات في النظام</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <p className="text-muted-foreground">المحتوى قيد التطوير - متاح فقط للمشرفين</p>
        </div>
      </CardContent>
    </Card>
  );
};
