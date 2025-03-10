
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";

export const FinancialReports = () => {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">التقارير المالية</h1>
          <p className="text-muted-foreground">عرض وتحليل التقارير المالية للمؤسسة</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>تقارير المصروفات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">لا توجد تقارير مصروفات متاحة.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>تقارير الإيرادات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">لا توجد تقارير إيرادات متاحة.</p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FinancialReports;
