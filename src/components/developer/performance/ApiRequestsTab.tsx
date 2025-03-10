
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { performanceMonitor } from "@/utils/performanceMonitor";

export const ApiRequestsTab: React.FC = () => {
  const apiData = performanceMonitor
    .getEvents()
    .filter(
      (e) => e.type === "resource" && e.metadata?.resourceType === "fetch"
    )
    .map((e) => ({
      name: e.name.split("/").pop(),
      duration: e.duration,
      time: new Date(
        performance.timeOrigin + e.startTime
      ).toLocaleTimeString(),
    }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>أداء طلبات API</CardTitle>
          <CardDescription>تحليل وقت استجابة طلبات API</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={apiData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="duration"
                  stroke="#82ca9d"
                  name="وقت الاستجابة (مللي ثانية)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
