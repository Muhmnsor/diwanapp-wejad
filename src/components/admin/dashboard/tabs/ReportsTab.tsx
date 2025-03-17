import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FilePieChart, FileBarChart } from "lucide-react";
import { toast } from "sonner";

interface ReportsTabProps {
  eventId: string;
}

export const ReportsTab = ({ eventId }: ReportsTabProps) => {
  const handleDownloadReport = (reportType: string) => {
    // This would eventually connect to a backend function to generate reports
    console.log(`Downloading ${reportType} report for event ${eventId}`);
    toast.info(`جاري إعداد تقرير ${reportType}...`);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">التقارير</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              <span>تقرير المسجلين</span>
            </CardTitle>
            <CardDescription>تفاصيل المسجلين وبياناتهم</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleDownloadReport('registrations')}
            >
              <Download className="h-4 w-4 mr-2" />
              تحميل التقرير
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FilePieChart className="h-5 w-5 text-primary" />
              <span>تقرير الحضور</span>
            </CardTitle>
            <CardDescription>إحصائيات الحضور ونسب المشاركة</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleDownloadReport('attendance')}
            >
              <Download className="h-4 w-4 mr-2" />
              تحميل التقرير
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileBarChart className="h-5 w-5 text-primary" />
              <span>تقرير التقييمات</span>
            </CardTitle>
            <CardDescription>تحليل التقييمات والملاحظات</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleDownloadReport('feedback')}
            >
              <Download className="h-4 w-4 mr-2" />
              تحميل التقرير
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>تقرير شامل</CardTitle>
            <CardDescription>تحميل تقرير يشمل جميع بيانات الفعالية</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => handleDownloadReport('comprehensive')}>
              <Download className="h-4 w-4 mr-2" />
              تحميل التقرير الشامل
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
