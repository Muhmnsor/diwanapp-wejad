
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Briefcase } from "lucide-react";

interface LeaveStatsProps {
  period: "yearly" | "quarterly" | "monthly";
}

export function LeaveStats({ period }: LeaveStatsProps) {
  // Sample data - in a real app, we would fetch this from an API
  const getPeriodData = () => {
    switch (period) {
      case "yearly":
        return { total: 120, approved: 110, rejected: 5, pending: 5 };
      case "quarterly":
        return { total: 40, approved: 35, rejected: 2, pending: 3 };
      case "monthly":
      default:
        return { total: 15, approved: 12, rejected: 1, pending: 2 };
    }
  };
  
  const stats = getPeriodData();
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الإجازات</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            إجازة خلال {period === "yearly" ? "السنة" : period === "quarterly" ? "الربع" : "الشهر"}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الإجازات المعتمدة</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.approved}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((stats.approved / stats.total) * 100)}% من إجمالي الإجازات
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">قيد الانتظار</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pending}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((stats.pending / stats.total) * 100)}% من إجمالي الإجازات
          </p>
        </CardContent>
      </Card>
    </>
  );
}
