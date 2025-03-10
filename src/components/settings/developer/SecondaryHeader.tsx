
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Settings, Bug, Gauge, Activity } from "lucide-react";

export const SecondaryHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active tab based on current path
  const getActiveTab = () => {
    if (location.pathname.includes('/admin/documentation')) {
      return 'documentation';
    }
    return 'settings';
  };
  
  const handleTabChange = (value: string) => {
    switch (value) {
      case 'documentation':
        navigate('/admin/documentation');
        break;
      case 'settings':
        navigate('/admin/developer-settings');
        break;
      default:
        navigate('/admin/developer-settings');
    }
  };
  
  return (
    <div className="w-full border-b bg-white">
      <div className="container mx-auto px-4 py-2">
        <Tabs value={getActiveTab()} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full justify-start bg-secondary/20">
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              إعدادات المطور
            </TabsTrigger>
            <TabsTrigger value="documentation" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              التوثيق
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              السجلات
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              الأداء
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
