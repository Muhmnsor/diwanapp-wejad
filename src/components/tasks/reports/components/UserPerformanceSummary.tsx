
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle, AlertCircle, Calendar } from "lucide-react";

interface UserPerformanceSummaryProps {
  summary: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueCount: number;
    completionRate: number;
    onTimeCompletionRate: number;
    averageCompletionTime: number;
  };
}

export const UserPerformanceSummary = ({ summary }: UserPerformanceSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">إجمالي المهام</p>
              <h3 className="text-2xl font-bold mt-1">{summary.totalTasks}</h3>
            </div>
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>نسبة الإكمال</span>
              <span className="font-medium">{summary.completionRate}%</span>
            </div>
            <Progress value={summary.completionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">المهام المكتملة</p>
              <h3 className="text-2xl font-bold mt-1">{summary.completedTasks}</h3>
            </div>
            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-sm text-muted-foreground mt-4">
              {summary.pendingTasks} مهام متبقية
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">معدل الإنجاز في الوقت المحدد</p>
              <h3 className="text-2xl font-bold mt-1">{summary.onTimeCompletionRate}%</h3>
            </div>
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-sm text-muted-foreground mt-4">
              متوسط وقت الإنجاز: {summary.averageCompletionTime} ساعة
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">المهام المتأخرة</p>
              <h3 className="text-2xl font-bold mt-1">{summary.overdueCount}</h3>
            </div>
            <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-sm text-muted-foreground mt-4">
              {Math.round((summary.overdueCount / summary.totalTasks) * 100) || 0}% من إجمالي المهام
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
