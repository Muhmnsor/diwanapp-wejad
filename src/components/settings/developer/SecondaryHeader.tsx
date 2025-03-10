
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
  
  const urlParams = new URLSearchParams(location.search);
  const activeTab = urlParams.get('tab') || 'overview';
  
  const handleTabChange = (value: string) => {
    navigate(`/admin/developer-settings?tab=${value}`);
  };
  
  return (
    <div className="w-full bg-white border-t py-3">
      <div className="flex justify-center">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="flex justify-center border-b rounded-none bg-white">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
            >
              <LayoutDashboard className="h-4 w-4" />
              نظرة عامة
            </TabsTrigger>
            
            <TabsTrigger 
              value="components" 
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
            >
              <Layers className="h-4 w-4" />
              المكونات الرئيسية
            </TabsTrigger>
            
            <TabsTrigger 
              value="database" 
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
            >
              <Database className="h-4 w-4" />
              قاعدة البيانات
            </TabsTrigger>
            
            <TabsTrigger 
              value="ui" 
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
            >
              <Layout className="h-4 w-4" />
              واجهة المستخدم
            </TabsTrigger>
            
            <TabsTrigger 
              value="technical" 
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
            >
              <Code className="h-4 w-4" />
              المعلومات التقنية
            </TabsTrigger>
            
            <TabsTrigger 
              value="general" 
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
            >
              <Activity className="h-4 w-4" />
              عام
            </TabsTrigger>
            
            <TabsTrigger 
              value="permissions" 
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
            >
              <Gauge className="h-4 w-4" />
              الصلاحيات
            </TabsTrigger>
            
            <TabsTrigger 
              value="cache" 
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
            >
              <Clock className="h-4 w-4" />
              الذاكرة المؤقتة
            </TabsTrigger>
            
            <TabsTrigger 
              value="debug" 
              className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-medium"
            >
              <Bug className="h-4 w-4" />
              التصحيح
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};
