
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ResourcesTabProps {
  resourceData: any[];
}

export const ResourcesTab: React.FC<ResourcesTabProps> = ({ resourceData }) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>أداء الموارد</CardTitle>
          <CardDescription>تحليل وقت تحميل الموارد حسب النوع</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resourceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Bar
                  yAxisId="left"
                  dataKey="avgDuration"
                  fill="#8884d8"
                  name="متوسط الوقت (مللي ثانية)"
                />
                <Bar
                  yAxisId="right"
                  dataKey="count"
                  fill="#82ca9d"
                  name="عدد الطلبات"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
