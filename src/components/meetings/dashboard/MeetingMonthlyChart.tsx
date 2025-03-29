
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

interface MonthlyData {
  name: string;
  value: number;
}

interface MeetingMonthlyChartProps {
  data: MonthlyData[];
  isLoading: boolean;
}

export const MeetingMonthlyChart: React.FC<MeetingMonthlyChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>التوزيع الشهري للاجتماعات</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>التوزيع الشهري للاجتماعات</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} اجتماع`, 'العدد']}
                labelFormatter={(label) => `${label}`}
              />
              <Bar dataKey="value" fill="#8884d8" name="عدد الاجتماعات" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
