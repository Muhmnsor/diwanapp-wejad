
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, InfoIcon, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/refactored-auth";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { permissionGroups } from "@/utils/developer/permissionsMapping";

export function DeveloperModeTab() {
  const { user } = useAuthStore();
  const [developerMode, setDeveloperMode] = useState(false);

  // Fetch developer settings
  const { 
    data: developerSettings, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['developer-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('developer_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching developer settings:', error);
        throw error;
      }
      
      // If no settings found, create default settings
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from('developer_settings')
          .insert({ 
            user_id: user.id, 
            is_enabled: false,
            debug_level: 'info'
          })
          .select()
          .single();
          
        if (insertError) {
          console.error('Error creating developer settings:', insertError);
          throw insertError;
        }
        
        return newData;
      }
      
      return data;
    },
    enabled: !!user?.id
  });

  // Update developer mode state when data changes
  useEffect(() => {
    if (developerSettings) {
      setDeveloperMode(developerSettings.is_enabled);
    }
  }, [developerSettings]);

  const toggleDeveloperMode = async () => {
    if (!user?.id) return;
    
    const newValue = !developerMode;
    
    try {
      const { error } = await supabase
        .from('developer_settings')
        .update({ 
          is_enabled: newValue,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setDeveloperMode(newValue);
      toast.success(newValue ? 'تم تفعيل وضع المطور' : 'تم إيقاف وضع المطور');
      refetch();
    } catch (error) {
      console.error('Error toggling developer mode:', error);
      toast.error('حدث خطأ أثناء تحديث وضع المطور');
    }
  };

  const { data: permissionsList, isLoading: permissionsLoading } = useQuery({
    queryKey: ['developer-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .eq('module', 'developer');
        
      if (error) {
        throw error;
      }
      
      return data || [];
    }
  });

  if (isLoading || permissionsLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">جاري تحميل إعدادات المطور...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-destructive mr-2" />
          <h3 className="font-medium text-destructive">حدث خطأ أثناء تحميل الإعدادات</h3>
        </div>
        <p className="text-sm text-destructive/80 mt-2">
          يرجى تحديث الصفحة والمحاولة مرة أخرى.
        </p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="settings">
      <TabsList className="mb-4">
        <TabsTrigger value="settings">
          إعدادات المطور
        </TabsTrigger>
        <TabsTrigger value="permissions">
          صلاحيات المطور
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle>إعدادات وضع المطور</CardTitle>
            <CardDescription>
              تحكم في ميزات وإعدادات المطور المتاحة لك في النظام
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-base font-medium">تفعيل وضع المطور</label>
                <p className="text-sm text-muted-foreground">
                  يتيح لك ذلك الوصول إلى أدوات ووظائف المطور المتقدمة
                </p>
              </div>
              <Switch 
                checked={developerMode} 
                onCheckedChange={toggleDeveloperMode}
              />
            </div>
            
            <Alert className="bg-muted">
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>ملاحظة</AlertTitle>
              <AlertDescription>
                عند تفعيل وضع المطور، سيتم عرض شريط أدوات المطور في أسفل الصفحة. يتيح لك هذا الشريط الوصول السريع إلى الأدوات المتاحة.
              </AlertDescription>
            </Alert>
            
            {developerMode && (
              <div className="pt-4">
                <h3 className="text-lg font-medium mb-2">أدوات المطور المتاحة:</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>عرض سجلات النظام والأخطاء</li>
                  <li>إدارة الصلاحيات وأدوار المستخدمين</li>
                  <li>التخصيص المتقدم للواجهة والوظائف</li>
                  <li>الوصول إلى بيانات النظام والإحصائيات</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="permissions">
        <Card>
          <CardHeader>
            <CardTitle>صلاحيات المطور</CardTitle>
            <CardDescription>
              استعراض صلاحيات المطور المتاحة في النظام
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {permissionGroups
                .filter(group => group.module === 'developer')
                .map(group => (
                  <div key={group.module} className="border rounded-md p-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <Badge variant="outline" className="mr-2">
                        {group.displayName}
                      </Badge>
                      {group.description}
                    </h3>
                    <div className="space-y-2 mt-4">
                      {group.permissions.map(permission => (
                        <div key={permission.id} className="flex items-center border-b pb-2">
                          <span className="text-sm">{permission.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
              {permissionsList && permissionsList.length > 0 && (
                <div className="rounded-md bg-muted p-4 mt-4">
                  <h3 className="font-medium mb-2">صلاحيات إضافية:</h3>
                  <div className="space-y-2">
                    {permissionsList.map(permission => (
                      <div key={permission.id} className="text-sm text-muted-foreground">
                        {permission.description || permission.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
