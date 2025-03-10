
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";

export const FinancialTargets = () => {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">الأهداف المالية</h1>
          <p className="text-muted-foreground">إدارة وتتبع الأهداف المالية للمؤسسة</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>الأهداف السنوية</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">لا توجد أهداف مالية محددة بعد.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>أداء الأهداف</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">لا توجد بيانات أداء متاحة.</p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FinancialTargets;
