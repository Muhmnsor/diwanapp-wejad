
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  Layers, 
  Database, 
  Layout, 
  Code, 
  Activity,
  Clock,
  Gauge,
  Bug 
} from "lucide-react";

export const SecondaryHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract the tab from the URL if it exists as a query parameter
  const urlParams = new URLSearchParams(location.search);
  const activeTab = urlParams.get('tab') || 'overview';
  
  const handleTabChange = (value: string) => {
    // Navigate to developer settings with the appropriate tab query parameter
    navigate(`/admin/developer-settings?tab=${value}`);
  };
  
  return (
    <div className="w-full border-b bg-white">
      <div className="container mx-auto px-4 py-2">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              عام
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              الصلاحيات
            </TabsTrigger>
            <TabsTrigger value="cache" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              الذاكرة المؤقتة
            </TabsTrigger>
            <TabsTrigger value="debug" className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              التصحيح
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};
