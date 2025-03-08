
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamTasksStats } from "./components/TeamTasksStats";
import { TeamProductivityChart } from "./components/TeamProductivityChart";
import { TeamWorkDistributionChart } from "./components/TeamWorkDistributionChart";
import { TeamPerformanceChart } from "./components/TeamPerformanceChart";
import { ProjectCompletionRateChart } from "./components/ProjectCompletionRateChart";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeamTasksStats } from "./hooks/useTeamTasksStats";

export const TeamTasksReports = () => {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'quarterly'>('monthly');
  const { data, isLoading } = useTeamTasksStats(period);
  
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
        <h3 className="text-lg font-medium">تقارير الفريق</h3>
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
      
      {/* Productivity Reports Section */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium">تقارير الإنتاجية</h4>
        <TeamTasksStats stats={data.teamStats} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">توزيع العمل بين أعضاء الفريق</CardTitle>
            </CardHeader>
            <CardContent>
              <TeamWorkDistributionChart data={data.workDistribution} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">معدل إنجاز المشاريع</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectCompletionRateChart data={data.projectCompletionRate} />
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">تحليل الأداء الجماعي</CardTitle>
          </CardHeader>
          <CardContent>
            <TeamPerformanceChart data={data.teamPerformance} />
          </CardContent>
        </Card>
      </div>
      
      {/* Time Reports Section */}
      <div className="space-y-6 mt-10 pt-10 border-t">
        <h4 className="text-lg font-medium">تقارير الوقت والجدولة</h4>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">الوقت المستغرق في كل مشروع</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <TeamProductivityChart data={data.timePerProject} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">تحليل الجدول الزمني للمشاريع</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] overflow-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-right border">المشروع</th>
                  <th className="p-2 text-right border">تاريخ البداية</th>
                  <th className="p-2 text-right border">الموعد النهائي</th>
                  <th className="p-2 text-right border">الحالة</th>
                  <th className="p-2 text-right border">الوقت المتبقي</th>
                </tr>
              </thead>
              <tbody>
                {data.timelineAnalysis.map((project, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-2 border">{project.name}</td>
                    <td className="p-2 border">{project.startDate}</td>
                    <td className="p-2 border">{project.dueDate}</td>
                    <td className="p-2 border">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        project.status === 'completed' ? 'bg-green-100 text-green-800' :
                        project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'delayed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status === 'completed' ? 'مكتمل' :
                         project.status === 'in_progress' ? 'قيد التنفيذ' :
                         project.status === 'delayed' ? 'متأخر' :
                         'معلق'}
                      </span>
                    </td>
                    <td className="p-2 border">{project.remainingTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
