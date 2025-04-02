
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeaveCharts } from "./components/LeaveCharts";
import { LeaveStats } from "./components/LeaveStats";

export function LeaveReport() {
  const [period, setPeriod] = useState<"yearly" | "quarterly" | "monthly">("monthly");
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">تقارير الإجازات</h2>
          <p className="text-muted-foreground">
            متابعة إحصائيات وبيانات الإجازات للموظفين
          </p>
        </div>
        
        <Tabs value={period} onValueChange={(v) => setPeriod(v as any)} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="monthly">شهري</TabsTrigger>
            <TabsTrigger value="quarterly">ربع سنوي</TabsTrigger>
            <TabsTrigger value="yearly">سنوي</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <LeaveStats period={period} />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <LeaveCharts period={period} />
      </div>
    </div>
  );
}
