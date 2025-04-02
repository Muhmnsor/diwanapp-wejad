
// src/components/hr/leaves/LeavesManagement.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

export function LeavesManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          إدارة الإجازات
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إدارة الإجازات والطلبات</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-lg mb-2">قيد التطوير</p>
          <p className="text-sm text-muted-foreground">
            ستتمكن قريباً من إدارة طلبات الإجازات وتخصيص استحقاقات الموظفين
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

