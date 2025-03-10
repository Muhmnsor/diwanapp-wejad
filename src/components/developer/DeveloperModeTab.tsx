
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/refactored-auth";
import { isDeveloperModeEnabled, toggleDeveloperMode } from "@/utils/developer/modeManagement";

export function DeveloperModeTab() {
  const { user } = useAuthStore();
  const [isDevModeEnabled, setIsDevModeEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDeveloperMode = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const enabled = await isDeveloperModeEnabled(user.id);
      setIsDevModeEnabled(enabled);
    } catch (error) {
      console.error('Error checking developer mode:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeveloperMode();
  }, [user]);

  const handleToggleDevMode = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const success = await toggleDeveloperMode(user.id, !isDevModeEnabled);
      if (success) {
        setIsDevModeEnabled(!isDevModeEnabled);
        toast.success(isDevModeEnabled ? 'تم تعطيل وضع المطور' : 'تم تفعيل وضع المطور');
      }
    } catch (error) {
      console.error('Error toggling developer mode:', error);
      toast.error('حدث خطأ أثناء تحديث وضع المطور');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">جاري تحميل إعدادات المطور...</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>إعدادات وضع المطور</CardTitle>
        <CardDescription>
          تحكم في إعدادات وضع المطور وأدوات التطوير
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <div className="space-y-1">
            <h3 className="font-medium">وضع المطور</h3>
            <p className="text-sm text-muted-foreground">
              تفعيل وضع المطور يتيح الوصول إلى أدوات وميزات تطوير إضافية
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Switch
                id="dev-mode"
                checked={isDevModeEnabled}
                onCheckedChange={handleToggleDevMode}
                disabled={isSubmitting}
              />
              <Label htmlFor="dev-mode">
                {isDevModeEnabled ? 'مفعل' : 'معطل'}
              </Label>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center border-b pb-4">
          <div className="space-y-1">
            <h3 className="font-medium">تحديث الإعدادات</h3>
            <p className="text-sm text-muted-foreground">
              تحديث إعدادات المطور وإعادة تحميل البيانات
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchDeveloperMode}
            disabled={isLoading || isSubmitting}
          >
            <RotateCcw className="ml-2 h-4 w-4" />
            تحديث
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
