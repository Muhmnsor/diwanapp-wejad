
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, UserCheck, GraduationCap, Calendar, DollarSign } from "lucide-react";
import { useState } from "react";

const HR = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary text-right my-[13px]">نظام إدارة شؤون الموظفين</h1>
          <p className="text-muted-foreground text-right">إدارة شاملة لشؤون الموظفين والموارد البشرية</p>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
          <TabsList className="grid grid-cols-6 w-full mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>نظرة عامة</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              <span>الموظفين</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>الحضور والإجازات</span>
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span>التدريب والتطوير</span>
            </TabsTrigger>
            <TabsTrigger value="compensation" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>التعويضات والمزايا</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>التقارير</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-right text-lg">إجمالي الموظفين</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">42</div>
                  <p className="text-sm text-muted-foreground">7 موظفين جدد هذا الشهر</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-right text-lg">الحضور اليوم</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">38</div>
                  <p className="text-sm text-muted-foreground">90% نسبة الحضور</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-right text-lg">الإجازات النشطة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">4</div>
                  <p className="text-sm text-muted-foreground">3 إجازات متوقعة الأسبوع القادم</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-right">الإشعارات والتنبيهات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg text-right">
                    <p className="font-medium">3 عقود ستنتهي هذا الشهر</p>
                    <p className="text-sm text-muted-foreground">يجب مراجعة العقود والتجديد إذا لزم الأمر</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg text-right">
                    <p className="font-medium">5 موظفين لم يكملوا التدريب الإلزامي</p>
                    <p className="text-sm text-muted-foreground">يجب متابعة حالة التدريب للالتزام بالمتطلبات</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">سيتم هنا عرض قائمة الموظفين وإدارة بياناتهم</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">سيتم هنا عرض سجلات الحضور وإدارة الإجازات</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">سيتم هنا إدارة برامج التدريب والتطوير المهني</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compensation" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">سيتم هنا إدارة الرواتب والمزايا والتعويضات</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">سيتم هنا عرض وإنشاء تقارير الموارد البشرية</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default HR;
