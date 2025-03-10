
import { useState, useEffect } from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { Code, Settings, Database, Layers, Terminal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useDeveloperStore } from "@/store/developerStore";
import { useAuthStore } from "@/store/authStore";
import { isDeveloper } from "@/utils/developerRole";

const DeveloperSettings = () => {
  const { user } = useAuthStore();
  const { settings, isLoading, fetchSettings, updateSettings } = useDeveloperStore();
  const [hasDeveloperAccess, setHasDeveloperAccess] = useState(false);

  useEffect(() => {
    fetchSettings();
    
    // Check if user has developer role
    if (user?.id) {
      const checkAccess = async () => {
        const result = await isDeveloper(user.id);
        setHasDeveloperAccess(result);
      };
      
      checkAccess();
    }
  }, [user?.id, fetchSettings]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <TopHeader />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Code className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-center">إعدادات المطورين</h1>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!hasDeveloperAccess) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <TopHeader />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Code className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-center">إعدادات المطورين</h1>
          </div>
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle>غير مصرح</CardTitle>
              <CardDescription>
                ليس لديك صلاحية الوصول لإعدادات المطورين
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                تتطلب هذه الصفحة أن يكون لديك دور "مطور" في النظام. يرجى التواصل مع مدير النظام إذا كنت تحتاج إلى هذه الصلاحية.
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Code className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-center">إعدادات المطورين</h1>
        </div>
        
        {settings && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    <CardTitle>الإعدادات الأساسية</CardTitle>
                  </div>
                </div>
                <CardDescription>إعدادات وضع المطور الأساسية</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dev-mode">وضع المطور</Label>
                    <p className="text-sm text-muted-foreground">
                      تفعيل أدوات ووضع المطور
                    </p>
                  </div>
                  <Switch
                    id="dev-mode"
                    checked={settings.is_enabled}
                    onCheckedChange={value => updateSettings({ is_enabled: value })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="toolbar">شريط أدوات المطور</Label>
                    <p className="text-sm text-muted-foreground">
                      إظهار شريط أدوات المطور في الواجهة
                    </p>
                  </div>
                  <Switch
                    id="toolbar"
                    checked={settings.show_toolbar}
                    onCheckedChange={value => updateSettings({ show_toolbar: value })}
                    disabled={!settings.is_enabled}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  <CardTitle>إعدادات ذاكرة التخزين المؤقت</CardTitle>
                </div>
                <CardDescription>إعدادات التخزين المؤقت وتحديث البيانات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="realtime">المزامنة الفورية</Label>
                    <p className="text-sm text-muted-foreground">
                      تفعيل تحديث البيانات بشكل فوري
                    </p>
                  </div>
                  <Switch
                    id="realtime"
                    checked={settings.realtime_enabled}
                    onCheckedChange={value => updateSettings({ realtime_enabled: value })}
                    disabled={!settings.is_enabled}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  <CardTitle>سجلات وتتبع الأخطاء</CardTitle>
                </div>
                <CardDescription>إعدادات التتبع وتسجيل الأخطاء</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="debug-level">مستوى التتبع</Label>
                    <p className="text-sm text-muted-foreground">
                      مستوى تفاصيل سجلات التتبع
                    </p>
                  </div>
                  <select
                    id="debug-level"
                    className="w-24 h-9 rounded-md border border-input bg-background px-3"
                    value={settings.debug_level}
                    onChange={e => updateSettings({ debug_level: e.target.value as any })}
                    disabled={!settings.is_enabled}
                  >
                    <option value="info">معلومات</option>
                    <option value="debug">تصحيح</option>
                    <option value="warn">تحذير</option>
                    <option value="error">خطأ</option>
                  </select>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-primary" />
                  <CardTitle>نظام التطوير</CardTitle>
                </div>
                <CardDescription>معلومات نظام التطوير</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">معرف المستخدم:</span>
                    <span className="font-mono">{user?.id.substring(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">تاريخ آخر تحديث:</span>
                    <span>{new Date(settings.updated_at).toLocaleString('ar')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default DeveloperSettings;
