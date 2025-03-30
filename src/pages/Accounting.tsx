
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";

const Accounting = () => {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-2xl font-bold mb-6">إدارة المحاسبة</h1>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center">نظام المحاسبة</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <Calculator className="h-20 w-20 text-primary mb-4" />
            <h2 className="text-xl mb-4">مرحباً بك في نظام المحاسبة</h2>
            <p className="text-center text-muted-foreground max-w-md">
              هذه الصفحة قيد التطوير. قريباً ستتمكن من إدارة الميزانية والمصروفات والإيرادات
              وإصدار التقارير المالية من خلال هذه الواجهة.
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Accounting;
