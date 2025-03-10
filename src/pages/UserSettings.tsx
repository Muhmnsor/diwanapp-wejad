
import { useState, useEffect } from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { Settings, User, Bell, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

export interface UserSettings {
  id: string;
  user_id: string;
  language: string;
  notifications_enabled: boolean;
  theme: string;
  created_at: string;
  updated_at: string;
}

const UserSettings = () => {
  const { user } = useAuthStore();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchUserSettings();
      fetchUserProfile();
    }
  }, [user?.id]);

  const fetchUserSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No record found, create default settings
          await createDefaultSettings();
        } else {
          console.error("Error fetching user settings:", error);
          toast.error("فشل في جلب إعدادات المستخدم");
        }
      } else {
        setSettings(data);
      }
    } catch (error) {
      console.error("Error in fetchUserSettings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', user!.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
      } else if (data) {
        setDisplayName(data.display_name || "");
        setEmail(data.email || "");
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    }
  };

  const createDefaultSettings = async () => {
    try {
      const defaultSettings = {
        user_id: user!.id,
        language: 'ar',
        notifications_enabled: true,
        theme: 'light'
      };

      const { data, error } = await supabase
        .from('user_settings')
        .insert(defaultSettings)
        .select()
        .single();

      if (error) {
        console.error("Error creating default settings:", error);
        toast.error("فشل في إنشاء الإعدادات الافتراضية");
      } else {
        setSettings(data);
      }
    } catch (error) {
      console.error("Error in createDefaultSettings:", error);
    }
  };

  const updateSettings = async (updatedValues: Partial<UserSettings>) => {
    if (!settings) return;

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('user_settings')
        .update(updatedValues)
        .eq('user_id', user!.id);

      if (error) {
        console.error("Error updating settings:", error);
        toast.error("فشل في تحديث الإعدادات");
      } else {
        setSettings({ ...settings, ...updatedValues });
        toast.success("تم تحديث الإعدادات بنجاح");
      }
    } catch (error) {
      console.error("Error in updateSettings:", error);
      toast.error("حدث خطأ أثناء تحديث الإعدادات");
    } finally {
      setIsSaving(false);
    }
  };

  const updateUserProfile = async () => {
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName
        })
        .eq('id', user!.id);

      if (error) {
        console.error("Error updating profile:", error);
        toast.error("فشل في تحديث الملف الشخصي");
      } else {
        toast.success("تم تحديث الملف الشخصي بنجاح");
      }
    } catch (error) {
      console.error("Error in updateUserProfile:", error);
      toast.error("حدث خطأ أثناء تحديث الملف الشخصي");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <TopHeader />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Settings className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-center">إعدادات المستخدم</h1>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
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
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-center">إعدادات المستخدم</h1>
        </div>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>الملف الشخصي</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>التفضيلات</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span>الإشعارات</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>معلومات الملف الشخصي</CardTitle>
                <CardDescription>
                  تحديث معلوماتك الشخصية
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name">الاسم الشخصي</Label>
                  <Input 
                    id="display-name" 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)} 
                    placeholder="أدخل اسمك الشخصي"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input 
                    id="email" 
                    value={email} 
                    readOnly 
                    disabled 
                    className="bg-gray-100"
                  />
                  <p className="text-sm text-muted-foreground">لا يمكن تغيير البريد الإلكتروني</p>
                </div>
                
                <Button 
                  onClick={updateUserProfile} 
                  disabled={isSaving || !displayName}
                  className="mt-4"
                >
                  {isSaving ? "جارِ الحفظ..." : "حفظ التغييرات"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>تفضيلات التطبيق</CardTitle>
                <CardDescription>
                  تخصيص تجربتك في التطبيق
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="theme">السمة</Label>
                        <p className="text-sm text-muted-foreground">
                          اختر سمة واجهة المستخدم
                        </p>
                      </div>
                      <select
                        id="theme"
                        className="w-32 h-9 rounded-md border border-input bg-background px-3"
                        value={settings.theme}
                        onChange={(e) => updateSettings({ theme: e.target.value })}
                      >
                        <option value="light">فاتح</option>
                        <option value="dark">داكن</option>
                        <option value="system">تلقائي (حسب النظام)</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="language">اللغة</Label>
                        <p className="text-sm text-muted-foreground">
                          اختر لغة واجهة المستخدم
                        </p>
                      </div>
                      <select
                        id="language"
                        className="w-32 h-9 rounded-md border border-input bg-background px-3"
                        value={settings.language}
                        onChange={(e) => updateSettings({ language: e.target.value })}
                      >
                        <option value="ar">العربية</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الإشعارات</CardTitle>
                <CardDescription>
                  تحكم في كيفية استلام الإشعارات
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings && (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifications">الإشعارات</Label>
                      <p className="text-sm text-muted-foreground">
                        تفعيل الإشعارات في التطبيق
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={settings.notifications_enabled}
                      onCheckedChange={(value) => updateSettings({ notifications_enabled: value })}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default UserSettings;
