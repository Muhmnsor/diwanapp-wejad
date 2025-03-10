
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Database, Layout, Code, LayoutDashboard, Layers } from "lucide-react";

export const SecondaryHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  
  // Default tab is 'overview'
  const getActiveTab = () => {
    // Extract the tab from the URL if it exists as a query parameter
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    
    if (tabParam) {
      return tabParam;
    }
    
    // Default to overview
    return 'overview';
  };
  
  const handleTabChange = (value: string) => {
    // Navigate to developer settings with the appropriate tab query parameter
    navigate(`/admin/developer-settings?tab=${value}`);
  };
  
  return (
    <div className="w-full border-b bg-white">
      <div className="container mx-auto px-4 py-2">
        <Tabs value={getActiveTab()} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full justify-start bg-secondary/20">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="components" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              المكونات الرئيسية
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              قاعدة البيانات
            </TabsTrigger>
            <TabsTrigger value="ui" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              واجهة المستخدم
            </TabsTrigger>
            <TabsTrigger value="technical" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              المعلومات التقنية
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};
