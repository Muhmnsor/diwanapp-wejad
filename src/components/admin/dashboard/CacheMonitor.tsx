
import React, { useState } from 'react';
import { useCacheMonitor } from '@/hooks/useCacheMonitor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { clearCacheByPrefix, resetCacheStats, freeUpCacheSpace } from '@/utils/cacheService';
import { clearServiceWorkerCache, updateServiceWorker } from '@/utils/serviceWorkerRegistration';
import { toast } from 'sonner';
import { BarChart, PieChart, RefreshCw, Trash2, Database, Archive, BarChart2, Clock, Network, Zap, Gauge } from 'lucide-react';
import { LineChart, Line, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

export const CacheMonitor = () => {
  const stats = useCacheMonitor(10000); // Update every 10 seconds
  const [isClearing, setIsClearing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Initialize realtime sync
  useRealtimeSync();
  
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
      toast.success('تم تحديث Service Worker بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث Service Worker');
      console.error('Error updating service worker:', error);
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
      toast.success(`تم تحسين المساحة بإزالة ${localRemoved + sessionRemoved} عنصر من التخزين المؤقت`);
    } catch (error) {
      toast.error('حدث خطأ أثناء تحسين المساحة');
      console.error('Error optimizing storage:', error);
    }
  };
  
  // Prepare data for charts
  const storageData = [
    { name: 'ذاكرة التخزين المؤقت', value: stats.memoryCacheCount, color: '#3b82f6' },
    { name: 'التخزين المحلي', value: stats.localStorageCount, color: '#10b981' },
    { name: 'تخزين الجلسة', value: stats.sessionStorageCount, color: '#f59e0b' }
  ];
  
  const hitsData = [
    { name: 'إصابات', value: stats.cacheHits, color: '#10b981' },
    { name: 'إخفاقات', value: stats.cacheMisses, color: '#ef4444' }
  ];
  
  // Mock historical data (in a real app, this would be stored and tracked over time)
  const historicalData = [
    { time: '09:00', hitRatio: 65, hits: 25, misses: 15 },
    { time: '10:00', hitRatio: 70, hits: 35, misses: 15 },
    { time: '11:00', hitRatio: 75, hits: 45, misses: 15 },
    { time: '12:00', hitRatio: 78, hits: 50, misses: 14 },
    { time: '13:00', hitRatio: 80, hits: 60, misses: 15 },
    { time: '14:00', hitRatio: stats.cacheHitRatio, hits: stats.cacheHits, misses: stats.cacheMisses }
  ];
  
  // Advanced metrics data
  const advancedMetrics = [
    { name: 'تحديثات متجمعة', value: stats.batchedUpdates || 0, color: '#8b5cf6' },
    { name: 'تحديثات مؤجلة', value: stats.throttledUpdates || 0, color: '#ec4899' }
  ];
  
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5" />
          مراقب التخزين المؤقت الذكي
        </CardTitle>
        <CardDescription>
          إحصائيات أداء نظام التخزين المؤقت الذكي
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
                <p className="text-2xl font-bold">{stats.cacheHitRatio}%</p>
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
                    <Tooltip />
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
                    <Tooltip />
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
                      <Tooltip />
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
                      <Tooltip />
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
              <h3 className="text-base font-medium mb-3">مزامنة الذاكرة المؤقتة</h3>
              <p className="text-sm text-muted-foreground mb-6">
                تتيح هذه الميزة مزامنة بيانات الذاكرة المؤقتة عبر علامات التبويب المختلفة وبين الجلسات.
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
                      نشط
                    </div>
                  </div>
                </div>
                
                <div className="bg-card border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <RefreshCw className="h-4 w-4 mr-2 text-purple-500" />
                    <h4 className="text-sm font-medium">المزامنة عند الاتصال</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    استئناف المزامنة تلقائيًا عند استعادة الاتصال
                  </p>
                  <div className="mt-4 flex justify-center">
                    <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                      نشط
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-card border rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium mb-2">إحصائيات المزامنة</h3>
                <div className="h-[250px] w-full">
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
                      <Tooltip />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
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
                <Button
                  variant="outline"
                  onClick={handleUpdateServiceWorker}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  تحديث Service Worker
                </Button>
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
            
            <div className="bg-card border rounded-lg p-4 mb-6">
              <h4 className="text-base font-medium mb-2">تحسين التخزين</h4>
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
