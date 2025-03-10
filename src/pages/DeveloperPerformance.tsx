
import { useState, useEffect } from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/refactored-auth";
import { checkDeveloperPermissions } from "@/components/users/permissions/utils/developerPermissionUtils";
import { performanceMonitor } from "@/utils/performanceMonitor";
import DeveloperRoute from "@/components/DeveloperRoute";
import { PerformanceHeader } from "@/components/developer/performance/PerformanceHeader";
import { PerformanceOverviewTab } from "@/components/developer/performance/PerformanceOverviewTab";
import { ResourcesTab } from "@/components/developer/performance/ResourcesTab";
import { ApiRequestsTab } from "@/components/developer/performance/ApiRequestsTab";
import { CustomMetricsTab } from "@/components/developer/performance/CustomMetricsTab";

const DeveloperPerformance = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [permissions, setPermissions] = useState({
    canViewPerformanceMetrics: false,
  });
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [resourceData, setResourceData] = useState<any[]>([]);
  const [customMetrics, setCustomMetrics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMonitoringEnabled, setIsMonitoringEnabled] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadPermissions(user.id);
      checkMonitoringStatus();
    }
  }, [user?.id]);

  const loadPermissions = async (userId: string) => {
    try {
      const permissionChecks = await checkDeveloperPermissions(userId);
      setPermissions({
        canViewPerformanceMetrics: permissionChecks.canViewPerformanceMetrics,
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading permissions:", error);
      setIsLoading(false);
    }
  };

  const checkMonitoringStatus = () => {
    try {
      const metrics = performanceMonitor.getMetrics();
      setIsMonitoringEnabled(performanceMonitor.getEvents().length > 0);
    } catch (error) {
      setIsMonitoringEnabled(false);
    }
  };

  const refreshData = () => {
    setIsLoading(true);
    
    // Get all performance events
    const events = performanceMonitor.getEvents();
    
    // Process navigation and paint events for overview
    const navigationEvents = events
      .filter(e => e.type === 'navigation' || e.type === 'paint')
      .map(e => ({
        name: e.name,
        value: e.duration || e.startTime,
        type: e.type
      }));
    setPerformanceData(navigationEvents);
    
    // Process resource events
    const resources = events.filter(e => e.type === 'resource');
    const resourcesByType = resources.reduce((acc, curr) => {
      const type = curr.metadata?.resourceType || 'other';
      if (!acc[type]) acc[type] = [];
      acc[type].push(curr);
      return acc;
    }, {} as Record<string, any[]>);
    
    const resourceChartData = Object.entries(resourcesByType).map(([type, items]) => ({
      name: type,
      count: items.length,
      avgDuration: items.reduce((sum, item) => sum + (item.duration || 0), 0) / items.length
    }));
    
    setResourceData(resourceChartData);
    
    // Process custom metrics
    const customEvents = events.filter(e => e.type === 'custom');
    setCustomMetrics(customEvents);
    
    setIsLoading(false);
  };

  useEffect(() => {
    refreshData();
    
    // Set up refresh interval
    const intervalId = setInterval(refreshData, 5000);
    
    return () => clearInterval(intervalId);
  }, [isMonitoringEnabled]);

  if (!permissions.canViewPerformanceMetrics) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <AdminHeader />
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-xl">وصول غير مصرح به</CardTitle>
              <CardDescription>
                لا تملك صلاحيات للوصول إلى مقاييس الأداء.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <PerformanceHeader 
          refreshData={refreshData}
          isMonitoringEnabled={isMonitoringEnabled}
          setIsMonitoringEnabled={setIsMonitoringEnabled}
        />
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
              <TabsTrigger value="resources">الموارد</TabsTrigger>
              <TabsTrigger value="api">طلبات API</TabsTrigger>
              <TabsTrigger value="custom">قياسات مخصصة</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <PerformanceOverviewTab performanceData={performanceData} />
            </TabsContent>
            
            <TabsContent value="resources">
              <ResourcesTab resourceData={resourceData} />
            </TabsContent>
            
            <TabsContent value="api">
              <ApiRequestsTab />
            </TabsContent>
            
            <TabsContent value="custom">
              <CustomMetricsTab customMetrics={customMetrics} />
            </TabsContent>
          </Tabs>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default function ProtectedPerformancePage() {
  return (
    <DeveloperRoute>
      <DeveloperPerformance />
    </DeveloperRoute>
  );
}
