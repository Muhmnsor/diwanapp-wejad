
import { useState, useEffect } from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/store/refactored-auth";
import { RefreshCw, Activity, Clock, Database, BarChart, Loader2 } from "lucide-react";
import { checkDeveloperPermissions } from "@/components/users/permissions/utils/developerPermissionUtils";
import { performanceMonitor } from "@/utils/performanceMonitor";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import DeveloperRoute from "@/components/DeveloperRoute";

const DeveloperPerformance = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
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
    // Check if monitoring is enabled by attempting to access metrics
    try {
      const metrics = performanceMonitor.getMetrics();
      setIsMonitoringEnabled(performanceMonitor.getEvents().length > 0);
    } catch (error) {
      setIsMonitoringEnabled(false);
    }
  };

  const toggleMonitoring = () => {
    if (isMonitoringEnabled) {
      performanceMonitor.disable();
      setIsMonitoringEnabled(false);
      toast({
        title: "تم إيقاف مراقبة الأداء",
        description: "تم إيقاف تتبع مقاييس الأداء",
      });
    } else {
      performanceMonitor.enable(true);
      setIsMonitoringEnabled(true);
      toast({
        title: "تم تفعيل مراقبة الأداء",
        description: "سيتم الآن تتبع مقاييس الأداء وعرضها",
      });
    }
  };

  const refreshData = () => {
    setIsLoading(true);
    
    // Get all performance events
    const events = performanceMonitor.getEvents();
    
    // Process navigation and paint events for overview
    const navigationEvents = events.filter(e => e.type === 'navigation' || e.type === 'paint');
    setPerformanceData(navigationEvents.map(e => ({
      name: e.name,
      value: e.duration || e.startTime,
      type: e.type
    })));
    
    // Process resource events
    const resources = events.filter(e => e.type === 'resource');
    const resourcesByType = resources.reduce((acc, curr) => {
      const type = curr.metadata?.resourceType || 'other';
      if (!acc[type]) acc[type] = [];
      acc[type].push(curr);
      return acc;
    }, {} as Record<string, any[]>);
    
    const resourceChartData = Object.entries(resourcesByType).map(([type, items]) => {
      return {
        name: type,
        count: items.length,
        avgDuration: items.reduce((sum, item) => sum + item.duration, 0) / items.length
      };
    });
    
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">مقاييس الأداء</h1>
            <p className="text-muted-foreground">مراقبة وتحليل أداء التطبيق</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refreshData}>
              <RefreshCw className="h-4 w-4 ml-2" />
              تحديث
            </Button>
            <Button 
              variant={isMonitoringEnabled ? "destructive" : "default"} 
              size="sm"
              onClick={toggleMonitoring}
            >
              <Activity className="h-4 w-4 ml-2" />
              {isMonitoringEnabled ? "إيقاف المراقبة" : "تفعيل المراقبة"}
            </Button>
          </div>
        </div>
        
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
            
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>نظرة عامة على الأداء</CardTitle>
                  <CardDescription>مقاييس تحميل الصفحة والرسم</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value.toFixed(2)} ms`} />
                        <Bar dataKey="value" fill="#8884d8" name="الوقت (بالمللي ثانية)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">زمن تحميل الصفحة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-muted-foreground ml-2" />
                      <span className="text-2xl font-bold">
                        {(performanceData.find(d => d.name === 'page-load')?.value || 0).toFixed(0)} 
                        <span className="text-sm font-normal text-muted-foreground mr-1">مللي ثانية</span>
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">أول رسم للمحتوى</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <BarChart className="h-5 w-5 text-muted-foreground ml-2" />
                      <span className="text-2xl font-bold">
                        {(performanceData.find(d => d.name === 'first-paint')?.value || 0).toFixed(0)} 
                        <span className="text-sm font-normal text-muted-foreground mr-1">مللي ثانية</span>
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">أول رسم للمحتوى</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Database className="h-5 w-5 text-muted-foreground ml-2" />
                      <span className="text-2xl font-bold">
                        {(performanceData.find(d => d.name === 'first-contentful-paint')?.value || 0).toFixed(0)} 
                        <span className="text-sm font-normal text-muted-foreground mr-1">مللي ثانية</span>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="resources" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>أداء الموارد</CardTitle>
                  <CardDescription>تحليل وقت تحميل الموارد حسب النوع</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={resourceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                        <Tooltip />
                        <Bar yAxisId="left" dataKey="avgDuration" fill="#8884d8" name="متوسط الوقت (مللي ثانية)" />
                        <Bar yAxisId="right" dataKey="count" fill="#82ca9d" name="عدد الطلبات" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="api" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>أداء طلبات API</CardTitle>
                  <CardDescription>تحليل وقت استجابة طلبات API</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={performanceMonitor.getEvents()
                          .filter(e => e.type === 'resource' && e.metadata?.resourceType === 'fetch')
                          .map(e => ({
                            name: e.name.split('/').pop(),
                            duration: e.duration,
                            time: new Date(performance.timeOrigin + e.startTime).toLocaleTimeString()
                          }))
                        }
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="duration" stroke="#82ca9d" name="وقت الاستجابة (مللي ثانية)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="custom" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>قياسات مخصصة</CardTitle>
                  <CardDescription>تحليل قياسات الأداء المخصصة</CardDescription>
                </CardHeader>
                <CardContent>
                  {customMetrics.length > 0 ? (
                    <div className="space-y-4">
                      <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={customMetrics.map(m => ({ name: m.name, duration: m.duration }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => `${value.toFixed(2)} ms`} />
                            <Bar dataKey="duration" fill="#8884d8" name="الوقت (بالمللي ثانية)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="border rounded-md overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-muted">
                              <th className="p-2 text-right">الاسم</th>
                              <th className="p-2 text-right">الوقت (مللي ثانية)</th>
                              <th className="p-2 text-right">وقت البدء</th>
                            </tr>
                          </thead>
                          <tbody>
                            {customMetrics.map((metric, index) => (
                              <tr key={index} className={index % 2 ? "bg-muted/50" : ""}>
                                <td className="p-2">{metric.name}</td>
                                <td className="p-2">{metric.duration.toFixed(2)}</td>
                                <td className="p-2">
                                  {new Date(performance.timeOrigin + metric.startTime).toLocaleTimeString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 text-muted-foreground">
                      لا توجد قياسات مخصصة متاحة. استخدم <code>performanceMonitor.startMeasure()</code> لإنشاء قياسات مخصصة.
                    </div>
                  )}
                </CardContent>
              </Card>
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
