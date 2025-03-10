import { useState, useEffect } from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { useDeveloperStore } from "@/store/developerStore";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DocumentationSection } from "@/components/settings/developer/documentation/DocumentationSection";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, RefreshCw, Clock, Gauge, Bug, Database, Activity, Users, Shield } from "lucide-react";
import { useAuthStore } from "@/store/refactored-auth";
import { toast } from "sonner";
import { assignDeveloperRole, removeDeveloperRole } from "@/utils/developerRoleIntegration";
import { checkDeveloperPermissions } from "@/components/users/permissions/utils/developerPermissionUtils";
import { DeveloperPermissionChecks } from "@/components/users/permissions/types";

const DeveloperSettings = () => {
  const { settings, isLoading, updateSettings, fetchSettings } = useDeveloperStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("general");
  const [permissions, setPermissions] = useState<DeveloperPermissionChecks>({
    canAccessDeveloperTools: false,
    canModifySystemSettings: false,
    canAccessApiLogs: false
  });
  const [roleAssigning, setRoleAssigning] = useState(false);
  
  useEffect(() => {
    if (user?.id) {
      loadDeveloperPermissions(user.id);
    }
  }, [user?.id]);
  
  const loadDeveloperPermissions = async (userId: string) => {
    const permissionChecks = await checkDeveloperPermissions(userId);
    setPermissions(permissionChecks);
  };
  
  const handleRefresh = async () => {
    await fetchSettings();
    if (user?.id) {
      await loadDeveloperPermissions(user.id);
    }
    toast.success("تم تحديث الإعدادات بنجاح");
  };
  
  const handleToggleDeveloperRole = async () => {
    if (!user?.id) return;
    
    setRoleAssigning(true);
    try {
      const hasDeveloperTools = permissions.canAccessDeveloperTools;
      
      if (hasDeveloperTools) {
        await removeDeveloperRole(user.id);
      } else {
        await assignDeveloperRole(user.id);
      }
      
      await loadDeveloperPermissions(user.id);
    } catch (error) {
      console.error('Error toggling developer role:', error);
      toast.error("حدث خطأ أثناء تغيير دور المطور");
    } finally {
      setRoleAssigning(false);
    }
  };
  
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <AdminHeader />
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-xl">وصول غير مصرح به</CardTitle>
              <CardDescription>
                لا تملك صلاحيات للوصول إلى صفحة إعدادات المطورين.
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
            <h1 className="text-2xl font-bold">إعدادات المطورين</h1>
            <p className="text-muted-foreground">إدارة إعدادات وأدوات التطوير</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 ml-2" />
              تحديث
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : settings ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="general">عام</TabsTrigger>
              <TabsTrigger value="documentation">التوثيق</TabsTrigger>
              <TabsTrigger value="permissions">الصلاحيات</TabsTrigger>
              <TabsTrigger value="cache">الذاكرة المؤقتة</TabsTrigger>
              <TabsTrigger value="debug">التصحيح</TabsTrigger>
              <TabsTrigger value="performance">الأداء</TabsTrigger>
              <TabsTrigger value="logs">السجلات</TabsTrigger>
            </TabsList>
            
            <TabsContent value="documentation">
              <DocumentationSection />
            </TabsContent>
            
            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>الإعدادات العامة</CardTitle>
                  <CardDescription>التحكم بالإعدادات الأساسية لوضع المطور</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="dev-mode">وضع المطور</Label>
                      <p className="text-sm text-muted-foreground">
                        تفعيل أو تعطيل وضع المطور في النظام
                      </p>
                    </div>
                    <Switch
                      id="dev-mode"
                      checked={settings.is_enabled}
                      onCheckedChange={(checked) => 
                        updateSettings({ is_enabled: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="show-toolbar">شريط أدوات المطور</Label>
                      <p className="text-sm text-muted-foreground">
                        عرض شريط أدوات المطور في واجهة المستخدم
                      </p>
                    </div>
                    <Switch
                      id="show-toolbar"
                      checked={settings.show_toolbar}
                      onCheckedChange={(checked) => 
                        updateSettings({ show_toolbar: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="realtime-enabled">التحديثات المباشرة</Label>
                      <p className="text-sm text-muted-foreground">
                        تفعيل اتصال Supabase المباشر للتحديثات الفورية
                      </p>
                    </div>
                    <Switch
                      id="realtime-enabled"
                      checked={settings.realtime_enabled}
                      onCheckedChange={(checked) => 
                        updateSettings({ realtime_enabled: checked })
                      }
                    />
                  </div>
                  
                  <Button 
                    className="mt-4 w-full" 
                    variant="default"
                    onClick={() => toast.success("تم حفظ الإعدادات")}
                  >
                    <Save className="h-4 w-4 ml-2" />
                    حفظ الإعدادات
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="permissions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>صلاحيات المطور</CardTitle>
                  <CardDescription>إدارة صلاحيات الوصول إلى أدوات المطور</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="mb-4 p-4 border rounded-md bg-muted/40">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">حالة دور المطور</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      دور المطور يمنح صلاحيات إضافية للوصول إلى أدوات وإعدادات المطور. 
                      {permissions.canAccessDeveloperTools 
                        ? " أنت تمتلك حالياً صلاحيات المطور." 
                        : " أنت لا تمتلك حالياً صلاحيات المطور."}
                    </p>
                    <Button
                      className="w-full"
                      variant={permissions.canAccessDeveloperTools ? "destructive" : "default"}
                      onClick={handleToggleDeveloperRole}
                      disabled={roleAssigning}
                    >
                      {roleAssigning ? (
                        <>
                          <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                          جاري المعالجة...
                        </>
                      ) : (
                        <>
                          <Users className="h-4 w-4 ml-2" />
                          {permissions.canAccessDeveloperTools ? "إزالة دور المطور" : "تعيين دور المطور"}
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium mb-2">الصلاحيات الحالية</h3>
                    
                    <div className="p-2 border rounded flex items-center justify-between">
                      <div>
                        <p className="font-medium">الوصول إلى أدوات المطور</p>
                        <p className="text-sm text-muted-foreground">السماح بعرض أدوات المطور المختلفة</p>
                      </div>
                      <div className={`px-2 py-1 rounded text-sm ${permissions.canAccessDeveloperTools ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {permissions.canAccessDeveloperTools ? 'مسموح' : 'غير مسموح'}
                      </div>
                    </div>
                    
                    <div className="p-2 border rounded flex items-center justify-between">
                      <div>
                        <p className="font-medium">تعديل إعدادات النظام</p>
                        <p className="text-sm text-muted-foreground">السماح بتعديل الإعدادات الأساسية للنظام</p>
                      </div>
                      <div className={`px-2 py-1 rounded text-sm ${permissions.canModifySystemSettings ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {permissions.canModifySystemSettings ? 'مسموح' : 'غير مسموح'}
                      </div>
                    </div>
                    
                    <div className="p-2 border rounded flex items-center justify-between">
                      <div>
                        <p className="font-medium">الوصول إلى سجلات API</p>
                        <p className="text-sm text-muted-foreground">السماح بعرض وتحليل سجلات طلبات API</p>
                      </div>
                      <div className={`px-2 py-1 rounded text-sm ${permissions.canAccessApiLogs ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {permissions.canAccessApiLogs ? 'مسموح' : 'غير مسموح'}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="mt-4 w-full" 
                    variant="outline"
                    onClick={handleRefresh}
                  >
                    <RefreshCw className="h-4 w-4 ml-2" />
                    تحديث الصلاحيات
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="cache" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات الذاكرة المؤقتة</CardTitle>
                  <CardDescription>إدارة الذاكرة المؤقتة وإعدادات التخزين</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                  
                  <div className="space-y-2">
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
                  
                  <Button className="w-full mt-4" onClick={() => toast.success("تم مسح الذاكرة المؤقتة")}>
                    <Database className="h-4 w-4 ml-2" />
                    مسح الذاكرة المؤقتة
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="debug" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات التصحيح</CardTitle>
                  <CardDescription>التحكم بمستوى التصحيح ورسائل الخطأ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="debug-level">مستوى التصحيح</Label>
                    <Select 
                      value={settings.debug_level} 
                      onValueChange={(value: "info" | "debug" | "warn" | "error") => 
                        updateSettings({ debug_level: value })
                      }
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
                  
                  <Button className="w-full mt-4" onClick={() => toast.success("تم إنشاء سجل تصحيح")}>
                    <Bug className="h-4 w-4 ml-2" />
                    إنشاء سجل تصحيح
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>قياس الأداء</CardTitle>
                  <CardDescription>مراقبة وقياس أداء التطبيق</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">وقت تحميل الصفحة</h3>
                        <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-md">300ms</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '15%' }}></div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">استخدام الذاكرة</h3>
                        <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-md">24MB</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">استجابة API</h3>
                        <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-md">120ms</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '12%' }}></div>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-2" onClick={() => toast.success("جاري قياس الأداء...")}>
                      <Gauge className="h-4 w-4 ml-2" />
                      قياس الأداء
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="logs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>سجلات النظام</CardTitle>
                  <CardDescription>عرض وتحليل سجلات التطبيق</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-black text-white p-4 rounded-md font-mono text-sm h-[300px] overflow-auto space-y-2">
                    <div className="text-green-400">[INFO] {new Date().toISOString()} - بدء تشغيل التطبيق</div>
                    <div className="text-blue-400">[DEBUG] {new Date().toISOString()} - تهيئة الاتصال بقاعدة البيانات</div>
                    <div className="text-blue-400">[DEBUG] {new Date().toISOString()} - تحميل إعدادات المستخدم</div>
                    <div className="text-yellow-400">[WARN] {new Date().toISOString()} - استجابة بطيئة من طلب الواجهة</div>
                    <div className="text-blue-400">[DEBUG] {new Date().toISOString()} - تحميل البيانات من الذاكرة المؤقتة</div>
                    <div className="text-red-400">[ERROR] {new Date().toISOString()} - فشل تحميل الصورة: network timeout</div>
                    <div className="text-blue-400">[DEBUG] {new Date().toISOString()} - محاولة إعادة تحميل الصورة</div>
                    <div className="text-green-400">[INFO] {new Date().toISOString()} - تم تسجيل دخول المستخدم</div>
                    <div className="text-blue-400">[DEBUG] {new Date().toISOString()} - تحديث رمز المصادقة</div>
                    <div className="text-green-400">[INFO] {new Date().toISOString()} - تحميل واجهة المستخدم اكتمل</div>
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <Button variant="outline" onClick={() => toast.success("تم تنزيل السجلات")}>
                      تنزيل السجلات
                    </Button>
                    <Button variant="outline" onClick={() => toast.success("تم مسح السجلات")}>
                      مسح السجلات
                    </Button>
                    <Button variant="outline" onClick={() => toast.success("تم تحديث السجلات")}>
                      <Activity className="h-4 w-4 ml-2" />
                      تحديث
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>لم يتم العثور على إعدادات</CardTitle>
              <CardDescription>
                لم يتم العثور على إعدادات المطور. يرجى التحقق من حسابك أو الاتصال بالمسؤول.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={fetchSettings}>
                إعادة المحاولة
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default DeveloperSettings;
