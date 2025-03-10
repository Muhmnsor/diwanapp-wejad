
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

interface CustomMetricsTabProps {
  customMetrics: any[];
}

export const CustomMetricsTab: React.FC<CustomMetricsTabProps> = ({
  customMetrics,
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>قياسات مخصصة</CardTitle>
          <CardDescription>تحليل قياسات الأداء المخصصة</CardDescription>
        </CardHeader>
        <CardContent>
          {customMetrics.length > 0 ? (
            <div className="space-y-4">
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={customMetrics.map((m) => ({
                      name: m.name,
                      duration: m.duration,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) =>
                        `${
                          typeof value === "number" ? value.toFixed(2) : value
                        } ms`
                      }
                    />
                    <Bar
                      dataKey="duration"
                      fill="#8884d8"
                      name="الوقت (بالمللي ثانية)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-2 text-right">الاسم</th>
                      <th className="p-2 text-right">الوقت (مللي ثانية)</th>
                      <th className="p-2 text-right">وقت البدء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customMetrics.map((metric, index) => (
                      <tr
                        key={index}
                        className={index % 2 ? "bg-muted/50" : ""}
                      >
                        <td className="p-2">{metric.name}</td>
                        <td className="p-2">{metric.duration.toFixed(2)}</td>
                        <td className="p-2">
                          {new Date(
                            performance.timeOrigin + metric.startTime
                          ).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              لا توجد قياسات مخصصة متاحة. استخدم{" "}
              <code>performanceMonitor.startMeasure()</code> لإنشاء قياسات
              مخصصة.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
