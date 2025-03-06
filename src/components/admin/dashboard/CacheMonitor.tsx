
import React from 'react';
import { useCacheMonitor } from '@/hooks/useCacheMonitor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { clearCacheByPrefix } from '@/utils/cacheService';
import { toast } from 'sonner';
import { BarChart, PieChart } from 'lucide-react';

export const CacheMonitor = () => {
  const stats = useCacheMonitor(10000); // Update every 10 seconds
  
  const handleClearAllCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      clearCacheByPrefix('');
      toast.success('تم مسح جميع ذاكرة التخزين المؤقت بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء مسح ذاكرة التخزين المؤقت');
      console.error('Error clearing cache:', error);
    }
  };
  
  const handleClearTasksCache = () => {
    try {
      clearCacheByPrefix('tasks');
      clearCacheByPrefix('supabase:tasks');
      clearCacheByPrefix('supabase:portfolio_tasks');
      clearCacheByPrefix('supabase:project_tasks');
      clearCacheByPrefix('supabase:subtasks');
      toast.success('تم مسح ذاكرة تخزين المهام المؤقتة بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء مسح ذاكرة تخزين المهام المؤقتة');
      console.error('Error clearing tasks cache:', error);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5" />
          مراقب التخزين المؤقت
        </CardTitle>
        <CardDescription>
          إحصائيات أداء نظام التخزين المؤقت الذكي
        </CardDescription>
      </CardHeader>
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
              <PieChart className="h-4 w-4 mr-2 text-blue-500" />
              <span className="text-lg font-medium">{stats.memoryCacheCount} عنصر</span>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">التخزين المحلي</h3>
            <div className="flex items-center">
              <PieChart className="h-4 w-4 mr-2 text-green-500" />
              <span className="text-lg font-medium">{stats.localStorageCount} عنصر</span>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">تخزين الجلسة</h3>
            <div className="flex items-center">
              <PieChart className="h-4 w-4 mr-2 text-amber-500" />
              <span className="text-lg font-medium">{stats.sessionStorageCount} عنصر</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 mt-6">
          <Button
            variant="outline"
            onClick={handleClearTasksCache}
            className="flex-1"
          >
            مسح ذاكرة تخزين المهام المؤقتة
          </Button>
          <Button
            variant="destructive"
            onClick={handleClearAllCache}
            className="flex-1"
          >
            مسح جميع ذاكرة التخزين المؤقت
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
