
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";

interface AppSetting {
  id: string;
  app_key: string;
  app_name: string;
  description: string;
  icon: string;
  path: string;
  is_visible: boolean;
  requires_permission: boolean;
  permission_key: string | null;
  order_index: number;
}

export const AppPermissionsManager = () => {
  const [activeTab, setActiveTab] = useState<string>("apps");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState<boolean>(false);

  const { data: appSettings = [], isLoading, error, refetch } = useQuery({
    queryKey: ['app-settings-manager'],
    queryFn: async (): Promise<AppSetting[]> => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .order('order_index');
        
      if (error) {
        console.error('Error fetching app settings:', error);
        throw error;
      }
      
      return data || [];
    }
  });

  const [editedSettings, setEditedSettings] = useState<AppSetting[]>([]);

  // Initialize edited settings when data is loaded
  useState(() => {
    if (appSettings.length > 0 && editedSettings.length === 0) {
      setEditedSettings([...appSettings]);
    }
  });

  const handleToggleVisibility = (appKey: string) => {
    setEditedSettings(prev => 
      prev.map(app => 
        app.app_key === appKey 
          ? { ...app, is_visible: !app.is_visible } 
          : app
      )
    );
  };

  const handleToggleRequiresPermission = (appKey: string) => {
    setEditedSettings(prev => 
      prev.map(app => 
        app.app_key === appKey 
          ? { ...app, requires_permission: !app.requires_permission } 
          : app
      )
    );
  };

  const handlePermissionKeyChange = (appKey: string, value: string) => {
    setEditedSettings(prev => 
      prev.map(app => 
        app.app_key === appKey 
          ? { ...app, permission_key: value } 
          : app
      )
    );
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSavedSuccessfully(false);
    
    try {
      // Update each app setting
      for (const app of editedSettings) {
        const { error } = await supabase
          .from('app_settings')
          .update({
            is_visible: app.is_visible,
            requires_permission: app.requires_permission,
            permission_key: app.permission_key
          })
          .eq('id', app.id);
          
        if (error) {
          console.error(`Error updating app ${app.app_key}:`, error);
          throw error;
        }
      }
      
      toast.success("تم حفظ إعدادات التطبيقات بنجاح");
      setSavedSuccessfully(true);
      refetch();
      
      // Reset success message after a delay
      setTimeout(() => {
        setSavedSuccessfully(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving app settings:', error);
      toast.error("حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">جاري تحميل إعدادات التطبيقات...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>حدث خطأ أثناء تحميل إعدادات التطبيقات</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>إدارة ظهور التطبيقات</CardTitle>
        <CardDescription>تحكم في ظهور التطبيقات في لوحة التحكم الرئيسية وتعيين الصلاحيات المطلوبة</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="apps">التطبيقات</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>
          
          <TabsContent value="apps">
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-lg grid grid-cols-12 font-semibold text-sm">
                <div className="col-span-3">التطبيق</div>
                <div className="col-span-3">المسار</div>
                <div className="col-span-2 text-center">ظاهر</div>
                <div className="col-span-2 text-center">يتطلب صلاحية</div>
                <div className="col-span-2 text-center">مفتاح الصلاحية</div>
              </div>
              
              {editedSettings.map(app => (
                <div key={app.id} className="border p-3 rounded-lg grid grid-cols-12 items-center">
                  <div className="col-span-3 font-medium">{app.app_name}</div>
                  <div className="col-span-3 text-sm text-muted-foreground">{app.path}</div>
                  <div className="col-span-2 flex justify-center">
                    <Switch 
                      checked={app.is_visible} 
                      onCheckedChange={() => handleToggleVisibility(app.app_key)}
                    />
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <Switch 
                      checked={app.requires_permission} 
                      onCheckedChange={() => handleToggleRequiresPermission(app.app_key)}
                      disabled={!app.is_visible}
                    />
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <Input 
                      value={app.permission_key || ''} 
                      onChange={(e) => handlePermissionKeyChange(app.app_key, e.target.value)}
                      placeholder="مفتاح الصلاحية"
                      className="h-8 text-sm"
                      disabled={!app.requires_permission || !app.is_visible}
                    />
                  </div>
                </div>
              ))}
              
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={handleSaveChanges} 
                  disabled={isSaving || savedSuccessfully}
                  className="gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      جار الحفظ...
                    </>
                  ) : savedSuccessfully ? (
                    <>
                      <Check className="h-4 w-4" />
                      تم الحفظ
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      حفظ التغييرات
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                سيتم إضافة المزيد من الإعدادات في المستقبل
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
