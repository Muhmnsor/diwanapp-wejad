
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useHRStats } from "@/hooks/hr/useHRStats";

export function LeaveDistributionChart() {
  const { data: stats, isLoading } = useHRStats();
  
  // Sample data - this would come from the API in a real implementation
  const leaveTypeData = [
    { name: 'سنوية', value: 15 },
    { name: 'مرضية', value: 8 },
    { name: 'طارئة', value: 5 },
    { name: 'أمومة', value: 2 },
    { name: 'بدون راتب', value: 1 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">توزيع الإجازات حسب النوع</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-60 w-full" />
        ) : (
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.leavesByType || leaveTypeData}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 30,
                  left: 50,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="عدد الإجازات" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
