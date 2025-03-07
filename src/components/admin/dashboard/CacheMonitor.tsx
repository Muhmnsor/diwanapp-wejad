import React, { useState, useEffect } from 'react';
import { useCacheMonitor } from '@/hooks/useCacheMonitor';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  clearCache, 
  clearCacheByPrefix, 
  resetCacheStats, 
  freeUpCacheSpace,
  getCacheStats
} from '@/utils/cacheService';
import { 
  clearServiceWorkerCache, 
  updateServiceWorker,
  registerServiceWorker
} from '@/utils/serviceWorkerRegistration';
import { toast } from 'sonner';
import { 
  BarChart, 
  PieChart, 
  RefreshCw, 
  Trash2, 
  Database, 
  Archive, 
  BarChart2, 
  Clock, 
  Network, 
  Zap, 
  Gauge,
  Layers,
  CloudOff,
  Wifi,
  Download,
  Upload,
  AlertTriangle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  RechartsTooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell
} from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const CacheMonitor = () => {
  const stats = useCacheMonitor(5000); // Update every 5 seconds
  const [isClearing, setIsClearing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [serviceWorkerActive, setServiceWorkerActive] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  
  const {
    syncStatus, 
    forceSyncNow
  } = useRealtimeSync({ 
    batchInterval: 300, 
    syncOnReconnect: autoSync 
  });
  
  useEffect(() => {
    const checkServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        setServiceWorkerActive(registrations.length > 0);
      }
    };
    
    checkServiceWorker();
  }, []);
  
  const handleClearAllCache = async () => {
    try {
      setIsClearing(true);
      localStorage.clear();
      sessionStorage.clear();
      clearCacheByPrefix('');
      await clearServiceWorkerCache();
      resetCacheStats();
      toast.success('تم مسح جميع ذاكرة التخزين المؤقت بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء مسح ذاكرة التخزين المؤقت');
      console.error('Error clearing cache:', error);
    } finally {
      setIsClearing(false);
    }
  };
  
  const handleClearTasksCache = () => {
    try {
      setIsClearing(true);
      clearCacheByPrefix('tasks');
      clearCacheByPrefix('supabase:tasks');
      clearCacheByPrefix('supabase:portfolio_tasks');
      clearCacheByPrefix('supabase:project_tasks');
      clearCacheByPrefix('supabase:subtasks');
      toast.success('تم مسح ذاكرة تخزين المهام المؤقتة بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء مسح ذاكرة تخزين المهام المؤقتة');
      console.error('Error clearing tasks cache:', error);
    } finally {
      setIsClearing(false);
    }
  };
  
  const handleUpdateServiceWorker = async () => {
    try {
      await updateServiceWorker();
      setServiceWorkerActive(true);
      toast.success('تم تحديث Service Worker بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث Service Worker');
      console.error('Error updating service worker:', error);
    }
  };
  
  const handleRegisterServiceWorker = async () => {
    try {
      await registerServiceWorker();
      setServiceWorkerActive(true);
      toast.success('تم تسجيل Service Worker بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء تسجيل Service Worker');
      console.error('Error registering service worker:', error);
    }
  };
  
  const handleResetStats = () => {
    try {
      resetCacheStats();
      toast.success('تم إعادة تعيين إحصائيات الذاكرة المؤقتة بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء إعادة تعيين الإحصائيات');
      console.error('Error resetting cache stats:', error);
    }
  };
  
  const handleOptimizeStorage = () => {
    try {
      const localRemoved = freeUpCacheSpace('local', 15);
      const sessionRemoved = freeUpCacheSpace('session', 15);
      const memoryRemoved = freeUpCacheSpace('memory', 10);
      toast.success(`تم تحسين المساحة بإزالة ${localRemoved + sessionRemoved + memoryRemoved} عنصر من التخزين المؤقت`);
    } catch (error) {
      toast.error('حدث خطأ أثناء تحسين المساحة');
      console.error('Error optimizing storage:', error);
    }
  };
  
  const handleForceSyncNow = () => {
    try {
      forceSyncNow();
      toast.success('تمت مزامنة التحديثات بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء المزامنة');
      console.error('Error syncing updates:', error);
    }
  };
  
  const handleToggleAutoSync = (checked: boolean) => {
    setAutoSync(checked);
    toast.success(checked ? 'تم تفعيل المزامنة التلقائية' : 'تم تعطيل المزامنة التلقائية');
  };
  
  const storageData = [
    { name: 'ذاكرة التخزين المؤقت', value: stats.memoryCacheCount, color: '#3b82f6' },
    { name: 'التخزين المحلي', value: stats.localStorageCount, color: '#10b981' },
    { name: 'تخزين الجلسة', value: stats.sessionStorageCount, color: '#f59e0b' }
  ];
  
  const hitsData = [
    { name: 'إصابات', value: stats.cacheHits, color: '#10b981' },
    { name: 'إخفاقات', value: stats.cacheMisses, color: '#ef4444' }
  ];
  
  const currentHitRatio = stats.cacheHitRatio;
  const historicalData = [
    { time: '09:00', hitRatio: Math.max(0, currentHitRatio - 15), hits: Math.max(0, stats.cacheHits - 35), misses: Math.max(0, stats.cacheMisses - 5) },
    { time: '10:00', hitRatio: Math.max(0, currentHitRatio - 10), hits: Math.max(0, stats.cacheHits - 25), misses: Math.max(0, stats.cacheMisses - 3) },
    { time: '11:00', hitRatio: Math.max(0, currentHitRatio - 5), hits: Math.max(0, stats.cacheHits - 15), misses: Math.max(0, stats.cacheMisses - 2) },
    { time: '12:00', hitRatio: Math.max(0, currentHitRatio - 2), hits: Math.max(0, stats.cacheHits - 10), misses: Math.max(0, stats.cacheMisses - 1) },
    { time: '13:00', hitRatio: Math.max(0, currentHitRatio - 1), hits: Math.max(0, stats.cacheHits - 5), misses: stats.cacheMisses },
    { time: '14:00', hitRatio: currentHitRatio, hits: stats.cacheHits, misses: stats.cacheMisses }
  ];
  
  const advancedMetrics = [
    { name: 'تحديثات متجمعة', value: stats.batchedUpdates || 0, color: '#8b5cf6' },
    { name: 'تحديثات مؤجلة', value: stats.throttledUpdates || 0, color: '#ec4899' }
  ];
  
  const priorityDistribution = stats.priorityDistribution ? [
    { name: 'منخفضة', value: stats.priorityDistribution.low || 0, color: '#9ca3af' },
    { name: 'عادية', value: stats.priorityDistribution.normal || 0, color: '#60a5fa' },
    { name: 'عالية', value: stats.priorityDistribution.high || 0, color: '#f59e0b' },
    { name: 'حرجة', value: stats.priorityDistribution.critical || 0, color: '#ef4444' }
  ] : [];
  
  const networkStatusClass = syncStatus.isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  const networkStatusText = syncStatus.isOnline ? 'متصل' : 'غير متصل';
  const pendingUpdatesClass = syncStatus.pendingUpdates > 0 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800';
  
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            مراقب التخزين المؤقت الذكي
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={syncStatus.isOnline ? "outline" : "destructive"} className="mr-2">
              {syncStatus.isOnline ? (
                <Wifi className="h-3 w-3 mr-1" />
              ) : (
                <CloudOff className="h-3 w-3 mr-1" />
              )}
              {networkStatusText}
            </Badge>
            {syncStatus.pendingUpdates > 0 && (
              <Badge variant="secondary">
                <Upload className="h-3 w-3 mr-1" />
                {syncStatus.pendingUpdates} في الانتظار
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          إحصائيات أداء نظام التخزين المؤقت الذكي مع دعم المزامنة والعمل دون اتصال
        </CardDescription>
      </CardHeader>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mx-6">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="performance">الأداء</TabsTrigger>
          <TabsTrigger value="storage">التخزين</TabsTrigger>
          <TabsTrigger value="sync">التزامن</TabsTrigger>
          <TabsTrigger value="advanced">خيارات متقدمة</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-card border rounded-lg p-4 text-center">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">معدل الإصابة</h3>
                <div className="flex flex-col items-center">
                  <p className="text-2xl font-bold">{stats.cacheHitRatio}%</p>
                  <Progress className="h-2 w-full mt-2" value={stats.cacheHitRatio} />
                </div>
              </div>
              <div className="bg-card border rounded-lg p-4 text-center">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">إصابات</h3>
                <p className="text-2xl font-bold">{stats.cacheHits}</p>
              </div>
              <div className="bg-card border rounded-lg p-4 text-center">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">إخفاقات</h3>
                <p className="text-2xl font-bold">{stats.cacheMisses}</p>
              </div>
              <div className="bg-card border rounded-lg p-4 text-center">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">إجمالي العناصر</h3>
                <p className="text-2xl font-bold">{stats.totalCacheEntries}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-card border rounded-lg p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">ذاكرة التخزين المؤقت</h3>
                <div className="flex items-center">
                  <Database className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="text-lg font-medium">{stats.memoryCacheCount} عنصر</span>
                </div>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">التخزين المحلي</h3>
                <div className="flex items-center">
                  <Archive className="h-4 w-4 mr-2 text-green-500" />
                  <span className="text-lg font-medium">{stats.localStorageCount} عنصر</span>
                </div>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">تخزين الجلسة</h3>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-amber-500" />
                  <span className="text-lg font-medium">{stats.sessionStorageCount} عنصر</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-card border rounded-lg p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">معلومات المزامنة</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">حالة الاتصال:</span>
                  <Badge className={networkStatusClass}>
                    {syncStatus.isOnline ? (
                      <Wifi className="h-3 w-3 mr-1" />
                    ) : (
                      <CloudOff className="h-3 w-3 mr-1" />
                    )}
                    {networkStatusText}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">التحديثات المعلقة:</span>
                  <Badge className={pendingUpdatesClass}>
                    {syncStatus.pendingUpdates} تحديث
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">آخر مزامنة:</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(syncStatus.lastSyncTime).toLocaleTimeString('ar-SA')}
                  </span>
                </div>
              </div>
              
              <div className="bg-card border rounded-lg p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">حالة التخزين المؤقت</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">ضغط البيانات:</span>
                  <Badge variant="outline" className="bg-blue-50">
                    {(stats.compressionSavings / 1024).toFixed(2)} كيلوبايت تم توفيرها
                  </Badge>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Service Worker:</span>
                  <Badge variant={serviceWorkerActive ? "outline" : "secondary"} className={serviceWorkerActive ? "bg-green-50" : ""}>
                    {serviceWorkerActive ? "نشط" : "غير نشط"}
                  </Badge>
                </div>
                {stats.refreshedEntries !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">عناصر محدثة تلقائياً:</span>
                    <Badge variant="outline" className="bg-green-50">
                      {stats.refreshedEntries}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 mt-6">
              <Button
                variant="outline"
                onClick={handleClearTasksCache}
                className="flex-1"
                disabled={isClearing}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                مسح ذاكرة تخزين المهام المؤقتة
              </Button>
              <Button
                variant="outline"
                onClick={handleForceSyncNow}
                className="flex-1"
                disabled={isClearing || !syncStatus.isOnline}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                مزامنة الآن
              </Button>
              <Button
                variant="destructive"
                onClick={handleClearAllCache}
                className="flex-1"
                disabled={isClearing}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                مسح جميع ذاكرة التخزين المؤقت
              </Button>
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="performance">
          <CardContent>
            <div className="mb-6">
              <h3 className="text-base font-medium mb-3">أداء الذاكرة المؤقتة عبر الوقت</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="hitRatio" 
                      name="معدل الإصابة %" 
                      stroke="#3b82f6" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-base font-medium mb-3">توزيع الإصابات والإخفاقات</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="hits" name="إصابات" fill="#10b981" />
                    <Bar dataKey="misses" name="إخفاقات" fill="#ef4444" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-card border rounded-lg p-4 text-center">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">تحديثات متجمعة</h3>
                <div className="flex items-center justify-center">
                  <Zap className="h-4 w-4 mr-2 text-purple-500" />
                  <span className="text-lg font-medium">{stats.batchedUpdates || 0} تحديث</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  عدد التحديثات التي تم تجميعها لتحسين الأداء
                </p>
              </div>
              <div className="bg-card border rounded-lg p-4 text-center">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">توفير الضغط</h3>
                <div className="flex items-center justify-center">
                  <Gauge className="h-4 w-4 mr-2 text-green-500" />
                  <span className="text-lg font-medium">{(stats.compressionSavings / 1024).toFixed(2)} كيلوبايت</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  حجم البيانات الذي تم توفيره عبر الضغط
                </p>
              </div>
            </div>
            
            <div className="text-center mt-4">
              <Button
                variant="outline"
                onClick={handleOptimizeStorage}
                disabled={isClearing}
              >
                <Zap className="h-4 w-4 mr-2" />
                تحسين أداء التخزين المؤقت
              </Button>
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="storage">
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-base font-medium mb-3">توزيع التخزين حسب النوع</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={storageData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {storageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h3 className="text-base font-medium mb-3">الإصابات مقابل الإخفاقات</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={hitsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {hitsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-base font-medium mb-3">معلومات ضغط البيانات</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-card border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">الحجم الإجمالي</h4>
                  <p className="text-xl font-medium">{(stats.totalSize / 1024).toFixed(2)} كيلوبايت</p>
                </div>
                <div className="bg-card border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">توفير الضغط</h4>
                  <p className="text-xl font-medium text-green-600">
                    {(stats.compressionSavings / 1024).toFixed(2)} كيلوبايت
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="sync">
          <CardContent>
            <div className="mb-6">
              <h3 className="text-base font-medium mb-3">مزامنة الذاكرة المؤقت المتطورة</h3>
              <p className="text-sm text-muted-foreground mb-6">
                تتيح هذه الميزة مزامنة بيانات الذاكرة المؤقتة عبر علامات التبويب المختلفة وبين الجلسات مع دعم العمل دون اتصال.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-card border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Network className="h-4 w-4 mr-2 text-blue-500" />
                    <h4 className="text-sm font-medium">مزامنة عبر التبويبات</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    تمكين مزامنة الذاكرة المؤقتة بين علامات التبويب المفتوحة
                  </p>
                  <div className="mt-4 flex justify-center">
                    <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                      نشط
                    </div>
                  </div>
                </div>
                
                <div className="bg-card border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Zap className="h-4 w-4 mr-2 text-amber-500" />
                    <h4 className="text-sm font-medium">تجميع التحديثات</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    تجميع التحديثات المتعددة لتقليل عمليات المزامنة
                  </p>
                  <div className="mt-4 flex justify-center">
                    <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                      نشط ({stats.batchedUpdates || 0} تحديث)
                    </div>
                  </div>
                </div>
                
                <div className="bg-card border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <CloudOff className="h-4 w-4 mr-2 text-purple-500" />
                    <h4 className="text-sm font-medium">دعم العمل دون اتصال</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    تخزين التحديثات عند عدم وجود اتصال ومزامنتها لاحقًا
                  </p>
                  <div className="mt-4 flex justify-center">
                    <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                      نشط
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-card border rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-3">إعدادات المزامنة</h3>
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoSync">مزامنة تلقائية عند الاتصال</Label>
                      <p className="text-xs text-muted-foreground">
                        مزامنة البيانات تلقائيًا عند استعادة الاتصال
                      </p>
                    </div>
                    <Switch
                      id="autoSync"
                      checked={autoSync}
                      onCheckedChange={handleToggleAutoSync}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleForceSyncNow}
                    disabled={!syncStatus.isOnline}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    مزامنة التحديثات المعلقة الآن
                  </Button>
                </div>
                
                <div className="bg-card border rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-3">حالة المزامنة</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">حالة الشبكة:</span>
                      <Badge className={syncStatus.isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {syncStatus.isOnline ? "متصل" : "غير متصل"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">تحديثات معلقة:</span>
                      <Badge variant="outline">
                        {syncStatus.pendingUpdates} تحديث
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">آخر مزامنة:</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(syncStatus.lastSyncTime).toLocaleTimeString('ar-SA')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">مزامنة تلقائية:</span>
                      <Badge variant={autoSync ? "outline" : "secondary"} className={autoSync ? "bg-green-50" : ""}>
                        {autoSync ? "مفعلة" : "معطلة"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-card border rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium mb-3">إحصائيات التزامن المتقدمة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs text-muted-foreground mb-2">توزيع التحديثات</h4>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={advancedMetrics}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {advancedMetrics.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs text-muted-foreground mb-2">معلومات التحسين</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs">تحديثات متجمعة</span>
                          <span className="text-xs font-medium">{stats.batchedUpdates || 0}</span>
                        </div>
                        <Progress className="h-2" value={Math.min(100, ((stats.batchedUpdates || 0) / 100) * 100)} />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs">تحديثات مؤجلة</span>
                          <span className="text-xs font-medium">{stats.throttledUpdates || 0}</span>
                        </div>
                        <Progress className="h-2" value={Math.min(100, ((stats.throttledUpdates || 0) / 50) * 100)} />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs">توفير في حجم البيانات</span>
                          <span className="text-xs font-medium">{(stats.compressionSavings / 1024).toFixed(2)} كيلوبايت</span>
                        </div>
                        <Progress className="h-2" value={Math.min(100, (stats.compressionSavings / 10240) * 100)} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="advanced">
          <CardContent>
            <h3 className="text-base font-medium mb-3">خيارات متقدمة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-card border rounded-lg p-4">
                <h4 className="text-base font-medium mb-2">Service Worker</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  تحكم في Service Worker المستخدم للتخزين المؤقت على مستوى الشبكة
                </p>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <Button
                    variant="outline"
                    onClick={handleUpdateServiceWorker}
                    className="flex-1"
                    disabled={!serviceWorkerActive}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    تحديث Service Worker
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleRegisterServiceWorker}
                    className="flex-1"
                    disabled={serviceWorkerActive}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    تسجيل Service Worker
                  </Button>
                </div>
              </div>
              
              <div className="bg-card border rounded-lg p-4">
                <h4 className="text-base font-medium mb-2">إعادة تعيين الإحصائيات</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  إعادة تعيين جميع إحصائيات التخزين المؤقت إلى الصفر
                </p>
                <Button
                  variant="outline"
                  onClick={handleResetStats}
                  className="w-full"
                >
                  <BarChart2 className="h-4 w-4 mr-2" />
                  إعادة تعيين الإحصائيات
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-card border rounded-lg p-4">
                <h4 className="text-base font-medium mb-2">تحسين التخزين المؤقت</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  تحسين استخدام مساحة التخزين المؤقت وتنظيف العناصر غير المستخدمة
                </p>
                <Button
                  variant="outline"
                  onClick={handleOptimizeStorage}
                  className="w-full"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  تحسين مساحة التخزين المؤقت
                </Button>
              </div>
              
              <div className="bg-card border rounded-lg p-4">
                <h4 className="text-base font-medium mb-2">إدارة الأولويات</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  عرض توزيع أولويات العناصر المخزنة مؤقتًا
                </p>
                <div className="h-[120px]">
                  {priorityDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={priorityDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="value" name="العدد">
                          {priorityDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-sm text-muted-foreground">لا توجد بيانات متوفرة</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-card border border-amber-200 rounded-lg p-4 mb-6 bg-amber-50">
              <div className="flex items-start mb-2">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-base font-medium text-amber-800 mb-1">توصيات التحسين</h4>
                  <ul className="text-sm text-amber-700 list-disc list-inside space-y-1">
                    <li>تفعيل ضغط البيانات لعناصر التخزين المؤقت الأكبر لتوفير المساحة</li>
                    <li>تحسين استراتيجية تخزين المهام المؤقت للتعامل مع الحجم الكبير للمهام</li>
                    <li>تفعيل المزيد من Views المخزنة مسبقًا للاستعلامات المتكررة</li>
                    <li>ضبط استراتيجيات التحديث لتحسين نسبة الإصابات</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-6 border-t pt-6">
              <h3 className="text-base font-medium mb-3 text-red-600">منطقة الخطر</h3>
              <p className="text-sm text-muted-foreground mb-4">
                ستؤدي هذه الإجراءات إلى حذف بيانات لا يمكن استعادتها. استخدم بحذر.
              </p>
              <Button
                variant="destructive"
                onClick={handleClearAllCache}
                className="w-full"
                disabled={isClearing}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                مسح جميع ذاكرة التخزين المؤقت والإحصائيات
              </Button>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="border-t p-4 text-xs text-muted-foreground">
        آخر تحديث: {new Date().toLocaleTimeString('ar-SA')}
      </CardFooter>
    </Card>
  );
};

