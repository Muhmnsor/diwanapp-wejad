
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPerformanceSummary } from "./components/UserPerformanceSummary";
import { UserAchievementsList } from "./components/UserAchievementsList";
import { UserTasksTimeline } from "./components/UserTasksTimeline";
import { UserTasksDistribution } from "./components/UserTasksDistribution";
import { UserProjectContributions } from "./components/UserProjectContributions";
import { UserUpcomingTasks } from "./components/UserUpcomingTasks";
import { UserRecentCompletions } from "./components/UserRecentCompletions";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserPerformanceReport } from "./hooks/useUserPerformanceReport";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const UserPerformanceReport = () => {
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const { data, isLoading } = useUserPerformanceReport(undefined, period);
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      
      const reportElement = document.getElementById('user-performance-report');
      if (!reportElement) {
        throw new Error("Report element not found");
      }
      
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      
      pdf.addImage(imgData, 'PNG', imgX, 0, imgWidth * ratio, imgHeight * ratio);
      pdf.save('تقرير-أداء-المهام.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
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
        <h3 className="text-lg font-medium">تقرير أداء المستخدم</h3>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <select 
            className="px-3 py-1 border rounded-md text-sm"
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'monthly' | 'quarterly' | 'yearly')}
          >
            <option value="monthly">شهري</option>
            <option value="quarterly">ربع سنوي</option>
            <option value="yearly">سنوي</option>
          </select>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportPDF} 
            disabled={isExporting}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'جاري التصدير...' : 'تصدير PDF'}
          </Button>
        </div>
      </div>
      
      <div id="user-performance-report" className="space-y-6">
        {data && <UserPerformanceSummary summary={data.summary} />}
        
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="projects">المشاريع</TabsTrigger>
            <TabsTrigger value="achievements">الإنجازات</TabsTrigger>
            <TabsTrigger value="tasks">المهام</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">توزيع المهام حسب الشهر</CardTitle>
                </CardHeader>
                <CardContent>
                  {data && <UserTasksTimeline data={data.tasksByMonth} />}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">توزيع المهام حسب الأولوية</CardTitle>
                </CardHeader>
                <CardContent>
                  {data && <UserTasksDistribution data={data.tasksByPriority} />}
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">المهام القادمة</CardTitle>
              </CardHeader>
              <CardContent>
                {data && <UserUpcomingTasks tasks={data.upcomingTasks} />}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">المساهمة في المشاريع</CardTitle>
              </CardHeader>
              <CardContent>
                {data && <UserProjectContributions data={data.tasksByProject} />}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">الإنجازات والجوائز</CardTitle>
              </CardHeader>
              <CardContent>
                {data && <UserAchievementsList achievements={data.achievements} />}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">المهام المكتملة مؤخراً</CardTitle>
              </CardHeader>
              <CardContent>
                {data && <UserRecentCompletions tasks={data.recentlyCompletedTasks} />}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
