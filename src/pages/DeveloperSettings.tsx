
import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/refactored-auth";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useDeveloperStore } from "@/store/developerStore";
import { Code, Activity, Terminal, Database, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DeveloperSettings: React.FC = () => {
  const { user } = useAuthStore();
  const { settings, isLoading, error, fetchSettings, updateSettings, toggleDevMode } = useDeveloperStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const [cacheTime, setCacheTime] = useState(5);
  const [updateInterval, setUpdateInterval] = useState(30);
  const [debugLevel, setDebugLevel] = useState<'info' | 'debug' | 'warn' | 'error'>('info');
  const [showToolbar, setShowToolbar] = useState(false);
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      setCacheTime(settings.cache_time_minutes || 5);
      setUpdateInterval(settings.update_interval_seconds || 30);
      setDebugLevel(settings.debug_level || 'info');
      setShowToolbar(settings.show_toolbar || false);
      setRealtimeEnabled(settings.realtime_enabled || false);
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    try {
      await updateSettings({
        cache_time_minutes: cacheTime,
        update_interval_seconds: updateInterval,
        debug_level: debugLevel,
        show_toolbar: showToolbar,
        realtime_enabled: realtimeEnabled
      });
      
      toast({
        title: "تم حفظ الإعدادات",
        description: "تم تحديث إعدادات المطور بنجاح",
      });
    } catch (err) {
      toast({
        title: "خطأ",
        description: "لم يتم حفظ الإعدادات بسبب خطأ في الخادم",
        variant: "destructive"
      });
    }
  };

  const handleToggleDeveloperMode = async () => {
    await toggleDevMode();
    toast({
      title: settings?.is_enabled ? "تم إيقاف وضع المطور" : "تم تفعيل وضع المطور",
      description: settings?.is_enabled ? "تم إيقاف الميزات المتقدمة" : "تم تفعيل الميزات المتقدمة للمطورين",
    });
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <AdminHeader />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <Card>
            <CardHeader>
              <CardTitle>خطأ</CardTitle>
              <CardDescription>حدث خطأ أثناء تحميل إعدادات المطور</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-red-500">
                {error.message || "تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى."}
              </p>
              <Button className="mt-4" onClick={() => fetchSettings()}>
                إعادة المحاولة
              </Button>
            </CardContent>
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
            <h1 className="text-2xl font-bold">إعدادات المطور</h1>
            <p className="text-muted-foreground">تكوين وإدارة إعدادات التطوير والتشخيص</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Switch
                id="dev-mode"
                checked={settings?.is_enabled || false}
                onCheckedChange={handleToggleDeveloperMode}
                disabled={isLoading}
              />
              <Label htmlFor="dev-mode">وضع المطور</Label>
            </div>
            
            <Button variant="default" onClick={handleSaveSettings} disabled={isLoading}>
              حفظ الإعدادات
            </Button>
          </div>
        </div>
      
        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>عام</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>الأداء</span>
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>قاعدة البيانات</span>
            </TabsTrigger>
            <TabsTrigger value="console" className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              <span>وحدة التحكم</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>الإعدادات العامة</CardTitle>
                <CardDescription>تكوين الإعدادات العامة للتطوير</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="debug-level">مستوى التصحيح</Label>
                  <Select
                    value={debugLevel}
                    onValueChange={(value) => setDebugLevel(value as 'info' | 'debug' | 'warn' | 'error')}
                  >
                    <SelectTrigger id="debug-level">
                      <SelectValue placeholder="اختر مستوى التصحيح" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">معلومات</SelectItem>
                      <SelectItem value="debug">تصحيح</SelectItem>
                      <SelectItem value="warn">تحذير</SelectItem>
                      <SelectItem value="error">خطأ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <Label htmlFor="show-toolbar">عرض شريط أدوات المطور</Label>
                    <p className="text-sm text-muted-foreground">عرض شريط أدوات التطوير في الشاشة الرئيسية</p>
                  </div>
                  <Switch
                    id="show-toolbar"
                    checked={showToolbar}
                    onCheckedChange={setShowToolbar}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <Label htmlFor="realtime-updates">تحديثات في الوقت الفعلي</Label>
                    <p className="text-sm text-muted-foreground">السماح بتحديثات الوقت الفعلي لبيانات التطوير</p>
                  </div>
                  <Switch
                    id="realtime-updates"
                    checked={realtimeEnabled}
                    onCheckedChange={setRealtimeEnabled}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>قياس الأداء</CardTitle>
                <CardDescription>مراقبة وتحليل أداء التطبيق</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="cache-time">مدة التخزين المؤقت (بالدقائق)</Label>
                    <span className="text-sm">{cacheTime} دقيقة</span>
                  </div>
                  <Slider
                    id="cache-time"
                    min={1}
                    max={60}
                    step={1}
                    value={[cacheTime]}
                    onValueChange={(value) => setCacheTime(value[0])}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="update-interval">فترة التحديث (بالثواني)</Label>
                    <span className="text-sm">{updateInterval} ثانية</span>
                  </div>
                  <Slider
                    id="update-interval"
                    min={5}
                    max={120}
                    step={5}
                    value={[updateInterval]}
                    onValueChange={(value) => setUpdateInterval(value[0])}
                  />
                </div>

                <Separator className="my-4" />

                <Button variant="secondary" asChild>
                  <Link to="/developer/performance">
                    <Activity className="h-4 w-4 ml-2" />
                    فتح لوحة قياس الأداء
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database">
            <Card>
              <CardHeader>
                <CardTitle>قاعدة البيانات</CardTitle>
                <CardDescription>استعلامات وأداء قاعدة البيانات</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-12">سيتم إضافة أدوات مراقبة قاعدة البيانات قريبًا</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="console">
            <Card>
              <CardHeader>
                <CardTitle>وحدة التحكم</CardTitle>
                <CardDescription>سجلات وأدوات التشخيص</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-12">سيتم إضافة أدوات وحدة التحكم قريبًا</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default DeveloperSettings;
