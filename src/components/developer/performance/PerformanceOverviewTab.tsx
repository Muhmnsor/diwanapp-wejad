
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Clock, BarChart as BarChartIcon, Database } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PerformanceOverviewTabProps {
  performanceData: any[];
}

export const PerformanceOverviewTab: React.FC<PerformanceOverviewTabProps> = ({
  performanceData,
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>نظرة عامة على الأداء</CardTitle>
          <CardDescription>مقاييس تحميل الصفحة والرسم</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: any) =>
                    `${typeof value === "number" ? value.toFixed(2) : value} ms`
                  }
                />
                <Bar
                  dataKey="value"
                  fill="#8884d8"
                  name="الوقت (بالمللي ثانية)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">زمن تحميل الصفحة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-muted-foreground ml-2" />
              <span className="text-2xl font-bold">
                {(
                  performanceData.find((d) => d.name === "page-load")?.value || 0
                ).toFixed(0)}
                <span className="text-sm font-normal text-muted-foreground mr-1">
                  مللي ثانية
                </span>
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">أول رسم للمحتوى</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChartIcon className="h-5 w-5 text-muted-foreground ml-2" />
              <span className="text-2xl font-bold">
                {(
                  performanceData.find((d) => d.name === "first-paint")?.value || 0
                ).toFixed(0)}
                <span className="text-sm font-normal text-muted-foreground mr-1">
                  مللي ثانية
                </span>
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">أول رسم للمحتوى</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Database className="h-5 w-5 text-muted-foreground ml-2" />
              <span className="text-2xl font-bold">
                {(
                  performanceData.find((d) => d.name === "first-contentful-paint")
                    ?.value || 0
                ).toFixed(0)}
                <span className="text-sm font-normal text-muted-foreground mr-1">
                  مللي ثانية
                </span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
