
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Repeat } from "lucide-react";

export const EmptyRecurringTasks: React.FC = () => {
  return (
    <Card className="bg-muted/30">
      <CardContent className="flex flex-col items-center justify-center py-10">
        <Repeat className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-medium mb-2 text-center">لا توجد مهام متكررة</h3>
        <p className="text-muted-foreground text-center max-w-md">
          يمكنك إنشاء مهام متكررة ليتم إنشاؤها تلقائياً حسب الجدول الزمني المحدد
        </p>
      </CardContent>
    </Card>
  );
};
