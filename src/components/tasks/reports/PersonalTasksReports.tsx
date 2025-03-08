
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonalTasksStats } from "./components/PersonalTasksStats";
import { PersonalProductivityChart } from "./components/PersonalProductivityChart";
import { TaskCompletionTimeChart } from "./components/TaskCompletionTimeChart";
import { TasksStatusDistribution } from "./components/TasksStatusDistribution";
import { PersonalPerformanceStats } from "./components/PersonalPerformanceStats";
import { DelayTimeChart } from "./components/DelayTimeChart";
import { OnTimeCompletionChart } from "./components/OnTimeCompletionChart";
import { Skeleton } from "@/components/ui/skeleton";
import { usePersonalTasksStats } from "./hooks/usePersonalTasksStats";

export const PersonalTasksReports = () => {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'quarterly'>('monthly');
  const { data, isLoading } = usePersonalTasksStats(period);
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">التقارير الشخصية</h3>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <select 
            className="px-3 py-1 border rounded-md text-sm"
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'weekly' | 'monthly' | 'quarterly')}
          >
            <option value="weekly">أسبوعي</option>
            <option value="monthly">شهري</option>
            <option value="quarterly">ربع سنوي</option>
          </select>
        </div>
      </div>
      
      {/* Tasks Statistics Section */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium">إحصائيات المهام الشخصية</h4>
        <PersonalTasksStats stats={data.tasksStats} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">توزيع المهام حسب الحالة</CardTitle>
            </CardHeader>
            <CardContent>
              <TasksStatusDistribution data={data.statusDistribution} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">إنتاجية العمل الشهرية</CardTitle>
            </CardHeader>
            <CardContent>
              <PersonalProductivityChart data={data.monthlyProductivity} />
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">متوسط وقت إنجاز المهام (بالأيام)</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskCompletionTimeChart data={data.completionTime} />
          </CardContent>
        </Card>
      </div>
      
      {/* Performance Statistics Section */}
      <div className="space-y-6 mt-10 pt-10 border-t">
        <h4 className="text-lg font-medium">إحصائيات الأداء الشخصي</h4>
        <PersonalPerformanceStats stats={data.performanceStats} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">متوسط وقت التأخير (بالأيام)</CardTitle>
            </CardHeader>
            <CardContent>
              <DelayTimeChart data={data.delayTime} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">المهام المنجزة قبل/بعد الموعد</CardTitle>
            </CardHeader>
            <CardContent>
              <OnTimeCompletionChart data={data.onTimeCompletion} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
