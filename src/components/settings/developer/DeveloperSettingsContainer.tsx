
import { useState, useEffect } from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { useDeveloperStore } from "@/store/developerStore";
import { useAuthStore } from "@/store/refactored-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Shield } from "lucide-react";
import { SecondaryHeader } from "@/components/settings/developer/SecondaryHeader";
import { useLocation } from "react-router-dom";
import { DocumentationContainer } from "@/components/documentation/DocumentationContainer";
import { DeveloperSettingsTabs } from "@/components/settings/developer/DeveloperSettingsTabs";
import { DeveloperPermissionChecks } from "@/components/users/permissions/types";
import { isDeveloper, assignDeveloperRole, removeDeveloperRole } from "@/utils/developer/roleManagement";
import { checkDeveloperPermissions } from "@/components/users/permissions/utils/developerPermissionUtils";
import { toast } from "sonner";

const DeveloperSettingsContainer = () => {
  const { settings, isLoading, error, fetchSettings } = useDeveloperStore();
  const { user } = useAuthStore();
  const location = useLocation();
  
  const urlParams = new URLSearchParams(location.search);
  const activeTab = urlParams.get('tab') || 'overview';
  
  const [permissions, setPermissions] = useState<DeveloperPermissionChecks>({
    canAccessDeveloperTools: false,
    canModifySystemSettings: false,
    canAccessApiLogs: false
  });
  const [roleAssigning, setRoleAssigning] = useState(false);
  const [hasDeveloperAccess, setHasDeveloperAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  
  useEffect(() => {
    if (user?.id) {
      checkDeveloperAccess();
      fetchSettings();
    }
  }, [user?.id, fetchSettings]);
  
  const checkDeveloperAccess = async () => {
    if (!user?.id) return;
    
    setCheckingAccess(true);
    try {
      const hasDeveloper = await isDeveloper(user.id);
      setHasDeveloperAccess(hasDeveloper);
      
      if (hasDeveloper) {
        loadDeveloperPermissions(user.id);
      }
      
      console.log('Developer access check:', { 
        userId: user.id, 
        email: user.email,
        role: user.role,
        hasDeveloperAccess: hasDeveloper
      });
    } catch (error) {
      console.error('Error checking developer access:', error);
    } finally {
      setCheckingAccess(false);
    }
  };
  
  const loadDeveloperPermissions = async (userId: string) => {
    const permissionChecks = await checkDeveloperPermissions(userId);
    setPermissions(permissionChecks);
  };
  
  const handleRefresh = async () => {
    await fetchSettings();
    if (user?.id) {
      await checkDeveloperAccess();
    }
    toast.success("تم تحديث الإعدادات بنجاح");
  };
  
  const handleToggleDeveloperRole = async () => {
    if (!user?.id) return;
    
    setRoleAssigning(true);
    try {
      if (hasDeveloperAccess) {
        await removeDeveloperRole(user.id);
      } else {
        await assignDeveloperRole(user.id);
      }
      
      await checkDeveloperAccess();
    } catch (error) {
      console.error('Error toggling developer role:', error);
      toast.error("حدث خطأ أثناء تغيير دور المطور");
    } finally {
      setRoleAssigning(false);
    }
  };
  
  const isDocumentationTab = ['overview', 'components', 'database', 'ui', 'technical'].includes(activeTab);
  
  if (checkingAccess) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <TopHeader />
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="mr-2">جاري التحقق من صلاحياتك...</span>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!hasDeveloperAccess) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <TopHeader />
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-xl">وصول غير مصرح به</CardTitle>
              <CardDescription>
                لا تملك صلاحيات للوصول إلى صفحة إعدادات المطورين.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                يتطلب الوصول إلى هذه الصفحة دور المطور. إذا كنت تحتاج للوصول، يرجى التواصل مع مسؤول النظام.
              </p>
              
              {user?.role === 'admin' && (
                <Button 
                  className="w-full" 
                  variant="default" 
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
                      <Shield className="h-4 w-4 ml-2" />
                      تعيين دور المطور لحسابي
                    </>
                  )}
                </Button>
              )}
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
      <SecondaryHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        {!isDocumentationTab && (
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">إعدادات المطورين</h1>
              <p className="text-muted-foreground">إدارة إعدادات وأدوات التطوير</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                تحديث
              </Button>
            </div>
          </div>
        )}
        
        {isDocumentationTab && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">توثيق النظام</h1>
            <p className="text-muted-foreground">توثيق شامل للنظام، وظائفه، ومكوناته</p>
          </div>
        )}
        
        {isDocumentationTab ? (
          <DocumentationContainer />
        ) : isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : settings ? (
          <DeveloperSettingsTabs 
            activeTab={activeTab} 
            settings={settings} 
            permissions={permissions}
            onRefresh={handleRefresh}
            hasDeveloperAccess={hasDeveloperAccess}
            onToggleDeveloperRole={handleToggleDeveloperRole}
            roleAssigning={roleAssigning}
          />
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

export default DeveloperSettingsContainer;
