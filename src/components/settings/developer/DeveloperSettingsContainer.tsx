
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Database, Code, Shield } from "lucide-react";

const DeveloperSettingsContainer = () => {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex items-center justify-center mb-8 gap-3">
          <Code className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-center">إعدادات المطور</h1>
        </div>
        
        <div className="bg-muted/20 p-6 rounded-lg mb-6">
          <p className="text-center text-muted-foreground">
            هذه الصفحة مخصصة للمطورين فقط. تتيح لك إدارة الإعدادات المتقدمة والوصول إلى أدوات التطوير
          </p>
        </div>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="general" className="flex gap-2 items-center">
              <Settings className="h-4 w-4" />
              إعدادات عامة
            </TabsTrigger>
            <TabsTrigger value="database" className="flex gap-2 items-center">
              <Database className="h-4 w-4" />
              قاعدة البيانات
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex gap-2 items-center">
              <Shield className="h-4 w-4" />
              الصلاحيات
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>الإعدادات العامة</CardTitle>
                <CardDescription>
                  إعدادات عامة لبيئة التطوير
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  محتوى الإعدادات العامة سيتم إضافته لاحقاً.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="database">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات قاعدة البيانات</CardTitle>
                <CardDescription>
                  إدارة اتصالات قاعدة البيانات والجداول
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  محتوى إعدادات قاعدة البيانات سيتم إضافته لاحقاً.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الصلاحيات</CardTitle>
                <CardDescription>
                  إدارة صلاحيات المطورين والوصول للنظام
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  محتوى إعدادات الصلاحيات سيتم إضافته لاحقاً.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default DeveloperSettingsContainer;
