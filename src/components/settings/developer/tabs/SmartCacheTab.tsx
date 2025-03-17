
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatabaseBackup, RefreshCw, Trash2, BarChart, Clock, FastForward } from "lucide-react";
import { useDeveloperStore } from "@/store/developerStore";
import { toast } from "sonner";
import { DeveloperSettings } from "@/types/developer";
import { clearCache, getCacheMetrics, prefetchQueries } from "@/lib/cache/smartCache";
import { useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";

interface SmartCacheTabProps {
  settings: DeveloperSettings;
}

export const SmartCacheTab = ({ settings }: SmartCacheTabProps) => {
  const { updateSettings } = useDeveloperStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("settings");
  const [isClearing, setIsClearing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const handleCacheClear = async () => {
    setIsClearing(true);
    try {
      await clearCache(queryClient);
    } finally {
      setIsClearing(false);
    }
  };
  
  const metrics = getCacheMetrics();
  const metricsList = Object.entries(metrics).map(([key, { hits, misses, lastUpdated }]) => ({
    key,
    hits,
    misses,
    hitRate: hits + misses > 0 ? (hits / (hits + misses)) * 100 : 0,
    lastUpdated,
  })).sort((a, b) => (b.hits + b.misses) - (a.hits + a.misses));

  return (
    <Card>
      <CardHeader>
        <CardTitle>إعدادات التخزين المؤقت الذكي</CardTitle>
        <CardDescription>ضبط وإدارة نظام التخزين المؤقت الذكي</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
            <TabsTrigger value="metrics">الإحصائيات</TabsTrigger>
            <TabsTrigger value="advanced">متقدم</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="cache-enabled">تفعيل التخزين المؤقت الذكي</Label>
                <Switch 
                  id="cache-enabled" 
                  checked={settings.is_enabled} 
                  onCheckedChange={(checked) => updateSettings({ is_enabled: checked })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cache-time">مدة التخزين المؤقت (بالدقائق)</Label>
                <div className="flex items-center space-x-2 gap-2">
                  <Input
                    id="cache-time"
                    type="number"
                    value={settings.cache_time_minutes}
                    onChange={(e) => 
                      updateSettings({ 
                        cache_time_minutes: parseInt(e.target.value) || 5 
                      })
                    }
                    min={1}
                    max={60}
                  />
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <Label htmlFor="update-interval">فترة التحديث (بالثواني)</Label>
                <div className="flex items-center space-x-2 gap-2">
                  <Input
                    id="update-interval"
                    type="number"
                    value={settings.update_interval_seconds}
                    onChange={(e) => 
                      updateSettings({ 
                        update_interval_seconds: parseInt(e.target.value) || 30 
                      })
                    }
                    min={5}
                    max={300}
                  />
                  <RefreshCw className="h-4 w-4" />
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full mt-4" 
              onClick={handleCacheClear}
              disabled={isClearing}
            >
              {isClearing ? (
                <>
                  <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
                  جاري مسح الذاكرة المؤقتة...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 ml-2" />
                  مسح الذاكرة المؤقتة
                </>
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="metrics">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">إحصائيات الذاكرة المؤقتة</h3>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="جميع الاستعلامات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الاستعلامات</SelectItem>
                    <SelectItem value="meetings">الاجتماعات</SelectItem>
                    <SelectItem value="events">الفعاليات</SelectItem>
                    <SelectItem value="users">المستخدمين</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {metricsList.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  لا توجد بيانات إحصائية متاحة بعد
                </div>
              ) : (
                <div className="space-y-4 mt-4">
                  {metricsList
                    .filter(m => selectedCategory === "all" || m.key.includes(selectedCategory))
                    .map((metric) => (
                      <div key={metric.key} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium truncate" title={metric.key}>{metric.key}</span>
                          <span>{metric.hitRate.toFixed(1)}% كفاءة</span>
                        </div>
                        <Progress value={metric.hitRate} />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{metric.hits} إصابة | {metric.misses} خطأ</span>
                          <span>آخر تحديث: {new Date(metric.lastUpdated).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="advanced">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">إعدادات متقدمة</h3>
              
              <div className="space-y-2">
                <Label htmlFor="debug-level">مستوى التحليل</Label>
                <Select 
                  value={settings.debug_level} 
                  onValueChange={(value) => updateSettings({ debug_level: value as any })}
                >
                  <SelectTrigger id="debug-level">
                    <SelectValue placeholder="اختر مستوى التحليل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">معلومات</SelectItem>
                    <SelectItem value="debug">تصحيح</SelectItem>
                    <SelectItem value="warn">تحذير</SelectItem>
                    <SelectItem value="error">خطأ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <Label htmlFor="realtime-enabled">تفعيل المزامنة الفورية</Label>
                <Switch 
                  id="realtime-enabled" 
                  checked={settings.realtime_enabled} 
                  onCheckedChange={(checked) => updateSettings({ realtime_enabled: checked })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button variant="outline" onClick={() => {
                  // Simulate prefetching meetings data
                  prefetchQueries(queryClient, [
                    { 
                      queryKey: ['meetings'], 
                      category: 'dynamic',
                      queryFn: async () => {
                        // This would be your actual fetch function
                        const response = await fetch('/api/meetings');
                        return response.json();
                      }
                    }
                  ], settings);
                  toast.success('تم بدء التحميل المسبق للبيانات');
                }}>
                  <FastForward className="h-4 w-4 ml-2" />
                  تحميل مسبق للبيانات
                </Button>
                
                <Button variant="outline" onClick={() => {
                  localStorage.clear();
                  toast.success('تم مسح التخزين المحلي');
                }}>
                  <DatabaseBackup className="h-4 w-4 ml-2" />
                  مسح التخزين المحلي
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
