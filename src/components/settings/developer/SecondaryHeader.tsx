
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const SecondaryHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleTabChange = (value: string) => {
    switch (value) {
      case "settings":
        navigate('/admin/developer-settings');
        break;
      case "documentation":
        navigate('/admin/documentation');
        break;
      case "logs":
        navigate('/admin/developer-logs');
        break;
      case "performance":
        navigate('/admin/developer-performance');
        break;
      case "debug":
        navigate('/admin/developer-debug');
        break;
      default:
        navigate('/admin/developer-settings');
    }
  };
  
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.includes('documentation')) return "documentation";
    if (path.includes('logs')) return "logs";
    if (path.includes('performance')) return "performance";
    if (path.includes('debug')) return "debug";
    return "settings";
  };

  return (
    <div className="w-full border-b bg-white">
      <div className="container mx-auto px-4 py-2">
        <Tabs value={getCurrentTab()} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full justify-stretch bg-secondary/50">
            <TabsTrigger value="settings" className="flex-1">إعدادات المطور</TabsTrigger>
            <TabsTrigger value="documentation" className="flex-1">التوثيق</TabsTrigger>
            <TabsTrigger value="logs" className="flex-1">السجلات</TabsTrigger>
            <TabsTrigger value="performance" className="flex-1">الأداء</TabsTrigger>
            <TabsTrigger value="debug" className="flex-1">التصحيح</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};
