
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const CategoriesTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>تصنيفات الاجتماعات</CardTitle>
        <CardDescription>تنظيم الاجتماعات حسب التصنيف</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <p className="text-muted-foreground">المحتوى قيد التطوير</p>
        </div>
      </CardContent>
    </Card>
  );
};
