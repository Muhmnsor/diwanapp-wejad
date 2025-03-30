
import { useState } from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, BarChart2, Receipt, PieChart, CreditCard } from "lucide-react";

const AccountingDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">نظام إدارة المحاسبة</h1>
          
          {/* Accounting Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6 flex items-center">
                <div className="rounded-full p-3 bg-blue-100 mr-4">
                  <Calculator className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold">0 ريال</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6 flex items-center">
                <div className="rounded-full p-3 bg-red-100 mr-4">
                  <Receipt className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">إجمالي المصروفات</p>
                  <p className="text-2xl font-bold">0 ريال</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6 flex items-center">
                <div className="rounded-full p-3 bg-green-100 mr-4">
                  <PieChart className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">صافي الأرباح</p>
                  <p className="text-2xl font-bold">0 ريال</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6 flex items-center">
                <div className="rounded-full p-3 bg-purple-100 mr-4">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">الفواتير المستحقة</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-5 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              <span>نظرة عامة</span>
            </TabsTrigger>
            <TabsTrigger value="income" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <span>الإيرادات</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span>المصروفات</span>
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span>الفواتير</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              <span>التقارير</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card className="p-6 text-center">
              <p className="text-lg text-gray-600">مرحباً بك في نظام إدارة المحاسبة</p>
              <p className="text-sm text-gray-500 mt-2">هنا يمكنك إدارة الميزانية والشؤون المالية للمؤسسة</p>
            </Card>
          </TabsContent>
          
          <TabsContent value="income">
            <Card className="p-6 text-center">
              <p className="text-lg text-gray-600">إدارة الإيرادات</p>
              <p className="text-sm text-gray-500 mt-2">قم بإدارة وتتبع جميع مصادر الدخل</p>
            </Card>
          </TabsContent>
          
          <TabsContent value="expenses">
            <Card className="p-6 text-center">
              <p className="text-lg text-gray-600">إدارة المصروفات</p>
              <p className="text-sm text-gray-500 mt-2">قم بإدارة وتتبع جميع المصروفات والنفقات</p>
            </Card>
          </TabsContent>
          
          <TabsContent value="invoices">
            <Card className="p-6 text-center">
              <p className="text-lg text-gray-600">إدارة الفواتير</p>
              <p className="text-sm text-gray-500 mt-2">قم بإنشاء وإدارة الفواتير ومتابعة حالتها</p>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports">
            <Card className="p-6 text-center">
              <p className="text-lg text-gray-600">التقارير المالية</p>
              <p className="text-sm text-gray-500 mt-2">قم بإنشاء وعرض التقارير المالية المختلفة</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default AccountingDashboard;
