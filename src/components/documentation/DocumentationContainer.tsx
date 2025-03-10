
import { useNavigate, useLocation } from "react-router-dom";
import { FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ComponentsDocumentation } from "./sections/ComponentsDocumentation";
import { DatabaseDocumentation } from "./sections/DatabaseDocumentation";
import { UIDocumentation } from "./sections/UIDocumentation";
import { TechnicalDocumentation } from "./sections/TechnicalDocumentation";
import { SystemOverview } from "./sections/SystemOverview";

export const DocumentationContainer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.hash ? location.hash.replace('#', '') : 'overview';

  const handleTabChange = (value: string) => {
    window.location.hash = value;
  };

  return (
    <div className="space-y-4">
      {/* Secondary header style navigation */}
      <div className="w-full border-b bg-white sticky top-0 z-10 mb-6">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between" dir="rtl">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost"
                className="gap-2"
                onClick={() => navigate('/admin/documentation')}
              >
                <FileText className="h-4 w-4" />
                التوثيق
              </Button>
              <Button 
                variant="ghost" 
                className="gap-2"
                onClick={() => navigate('/admin/developer-settings')}
              >
                <Settings className="h-4 w-4" />
                إعدادات المطور
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation tabs content */}
      <div className="bg-white rounded-lg p-4 border">
        <div className="mb-4 flex justify-center">
          <div className="flex gap-6 items-center">
            <Button 
              variant={activeTab === "overview" ? "secondary" : "ghost"} 
              onClick={() => handleTabChange("overview")}
              className="font-medium"
            >
              نظرة عامة
            </Button>
            <Button 
              variant={activeTab === "components" ? "secondary" : "ghost"} 
              onClick={() => handleTabChange("components")}
              className="font-medium"
            >
              المكونات الرئيسية
            </Button>
            <Button 
              variant={activeTab === "database" ? "secondary" : "ghost"} 
              onClick={() => handleTabChange("database")}
              className="font-medium"
            >
              قاعدة البيانات
            </Button>
            <Button 
              variant={activeTab === "ui" ? "secondary" : "ghost"} 
              onClick={() => handleTabChange("ui")}
              className="font-medium"
            >
              واجهة المستخدم
            </Button>
            <Button 
              variant={activeTab === "technical" ? "secondary" : "ghost"} 
              onClick={() => handleTabChange("technical")}
              className="font-medium"
            >
              المعلومات التقنية
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} className="mt-6">
          <TabsContent value="overview">
            <SystemOverview />
          </TabsContent>
          
          <TabsContent value="components">
            <ComponentsDocumentation />
          </TabsContent>
          
          <TabsContent value="database">
            <DatabaseDocumentation />
          </TabsContent>
          
          <TabsContent value="ui">
            <UIDocumentation />
          </TabsContent>
          
          <TabsContent value="technical">
            <TechnicalDocumentation />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
