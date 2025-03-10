
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { ArrowRight, FileText, Settings, Bug, Database, Activity, Shield, Clock, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const SecondaryHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("general");
  
  useEffect(() => {
    // Set active tab from URL parameter if available
    if (location.pathname === "/developer-settings") {
      const tabParam = searchParams.get("tab");
      if (tabParam) {
        setActiveTab(tabParam);
      } else {
        // Set the default tab if no parameter is present
        setActiveTab("general");
      }
    }
  }, [location.pathname, searchParams]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL parameter when tab changes
    setSearchParams({ tab: value });
  };
  
  const handleSectionChange = (path: string) => {
    navigate(path);
  };
  
  return (
    <div className="w-full border-b bg-white">
      <div className="container mx-auto px-4 py-2">
        <div className="flex flex-col gap-4" dir="rtl">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-4">
              <Button 
                variant={location.pathname === "/documentation" ? "default" : "ghost"}
                className="gap-2"
                onClick={() => handleSectionChange('/documentation')}
              >
                <FileText className="h-4 w-4" />
                التوثيق
              </Button>
              <Button 
                variant={location.pathname === "/developer-settings" ? "default" : "ghost"}
                className="gap-2"
                onClick={() => handleSectionChange('/developer-settings')}
              >
                <Settings className="h-4 w-4" />
                إعدادات المطور
              </Button>
            </div>
          </div>
          
          {location.pathname === "/developer-settings" && (
            <div className="flex justify-center pb-1">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full max-w-4xl">
                <TabsList className="justify-center">
                  <TabsTrigger value="general">عام</TabsTrigger>
                  <TabsTrigger value="documentation">التوثيق</TabsTrigger>
                  <TabsTrigger value="permissions">الصلاحيات</TabsTrigger>
                  <TabsTrigger value="cache">الذاكرة المؤقتة</TabsTrigger>
                  <TabsTrigger value="debug">التصحيح</TabsTrigger>
                  <TabsTrigger value="performance">الأداء</TabsTrigger>
                  <TabsTrigger value="logs">السجلات</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
