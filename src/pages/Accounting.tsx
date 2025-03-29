import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, PieChart, BarChart, CreditCard, FileText, Receipt } from "lucide-react";
import { useState } from "react";
const Accounting = () => {
  const [activeTab, setActiveTab] = useState("overview");
  return <div className="min-h-screen flex flex-col bg-gray-50">
      <TopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary text-right my-[13px]">نظام إدارة المحاسبة</h1>
          <p className="text-muted-foreground text-right">إدارة الأمور المالية والمحاسبية </p>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
          <TabsList className="grid grid-cols-6 w-full mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              <span>نظرة عامة</span>
            </TabsTrigger>
            <TabsTrigger value="revenues" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span>الإيرادات</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span>المصروفات</span>
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span>الفواتير</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>التقارير</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <span>الإعدادات</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-right text-lg">إجمالي الإيرادات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">₪120,500</div>
                  <p className="text-sm text-muted-foreground">زيادة 15% عن الشهر الماضي</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-right text-lg">إجمالي المصروفات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">₪85,320</div>
                  <p className="text-sm text-muted-foreground">نقص 5% عن الشهر الماضي</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-right text-lg">صافي الربح</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">₪35,180</div>
                  <p className="text-sm text-muted-foreground">زيادة 25% عن الشهر الماضي</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-right">الفواتير المستحقة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-red-50 rounded-lg text-right">
                    <p className="font-medium">5 فواتير مستحقة الدفع</p>
                    <p className="text-sm text-muted-foreground">إجمالي المبلغ: ₪12,450</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-right">
                    <p className="font-medium">8 مدفوعات متوقعة</p>
                    <p className="text-sm text-muted-foreground">إجمالي المبلغ: ₪24,800</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenues" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">سيتم هنا عرض وإدارة مصادر الإيرادات</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">سيتم هنا عرض وإدارة المصروفات والنفقات</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">سيتم هنا إدارة الفواتير الصادرة والواردة</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">سيتم هنا عرض وإنشاء التقارير المالية</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">سيتم هنا ضبط إعدادات النظام المحاسبي</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>;
};
export default Accounting;