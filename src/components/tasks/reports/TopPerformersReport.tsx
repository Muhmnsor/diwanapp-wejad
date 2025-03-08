
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, Users, Trophy, Star, Award, Clock, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTopPerformers } from "./hooks/useTopPerformers";
import { TopPerformerCard } from "./components/TopPerformerCard";
import { CategoryPerformersCard } from "./components/CategoryPerformersCard";
import { PerformerBadge } from "./components/PerformerBadge";
import { AchievementsLeaderboard } from "./components/AchievementsLeaderboard";
import { TopPerformersChart } from "./components/TopPerformersChart";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const TopPerformersReport = () => {
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const { data, isLoading } = useTopPerformers(period);
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      
      const reportElement = document.getElementById('top-performers-report');
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
      pdf.save('تقرير-أفضل-المستخدمين.pdf');
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
  
  const periodLabel = 
    period === 'monthly' ? 'الشهر' : 
    period === 'quarterly' ? 'الربع السنوي' : 'السنة';
  
  const topThreeUsers = data?.monthlyLeaders.slice(0, 3) || [];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">أفضل المستخدمين أداءً</h3>
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
      
      <div id="top-performers-report" className="space-y-6">
        {/* Top Performers Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <span>متصدرو الأداء لهذا {periodLabel}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-6">
              {/* Top three badges */}
              <div className="flex justify-center items-end gap-2 md:gap-6 py-4">
                {topThreeUsers.length >= 2 && (
                  <div className="flex flex-col items-center gap-2">
                    <PerformerBadge 
                      performer={topThreeUsers[1]} 
                      position={2} 
                      size="md"
                    />
                    <span className="text-sm font-medium">{topThreeUsers[1].name}</span>
                  </div>
                )}
                
                {topThreeUsers.length >= 1 && (
                  <div className="flex flex-col items-center gap-2 -mt-4">
                    <PerformerBadge 
                      performer={topThreeUsers[0]} 
                      position={1} 
                      size="lg"
                    />
                    <span className="text-sm font-medium">{topThreeUsers[0].name}</span>
                    <span className="text-xs text-muted-foreground">
                      {topThreeUsers[0].stats.completedTasks} مهمة منجزة
                    </span>
                  </div>
                )}
                
                {topThreeUsers.length >= 3 && (
                  <div className="flex flex-col items-center gap-2">
                    <PerformerBadge 
                      performer={topThreeUsers[2]} 
                      position={3} 
                      size="md"
                    />
                    <span className="text-sm font-medium">{topThreeUsers[2].name}</span>
                  </div>
                )}
              </div>
              
              {/* Productivity chart for all top performers */}
              {data?.monthlyLeaders && data.monthlyLeaders.length > 0 && (
                <TopPerformersChart
                  data={data.monthlyLeaders}
                  metricKey="completedTasks"
                  metricLabel="المهام المنجزة"
                  color="#3b82f6"
                />
              )}
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="categories">
          <TabsList className="mb-6">
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>فئات الأداء</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span>الإنجازات</span>
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>مخططات الأداء</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data?.categories.map((category, index) => (
                <CategoryPerformersCard 
                  key={index} 
                  category={category} 
                  metric={
                    index === 0 ? 'completion' : 
                    index === 1 ? 'onTime' : 
                    index === 2 ? 'speed' : 
                    'productivity'
                  }
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="h-5 w-5 text-purple-500" />
                      <span>أبرز الإنجازات</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {data?.achievementLeaders.slice(0, 4).map((performer) => (
                        <TopPerformerCard 
                          key={performer.id} 
                          performer={performer} 
                          metric="achievements"
                          showRank={true}
                          size="md"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <AchievementsLeaderboard 
                  performers={data?.achievementLeaders || []} 
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="charts" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>نسب إنجاز المهام</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data?.monthlyLeaders && (
                    <TopPerformersChart
                      data={data.monthlyLeaders}
                      metricKey="completionRate"
                      metricLabel="نسبة الإنجاز (%)"
                      color="#10b981"
                    />
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-500" />
                    <span>نسب الالتزام بالمواعيد</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data?.monthlyLeaders && (
                    <TopPerformersChart
                      data={data.monthlyLeaders}
                      metricKey="onTimeRate"
                      metricLabel="نسبة الالتزام بالمواعيد (%)"
                      color="#f59e0b"
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
