
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { DeveloperSettings } from "@/types/developer";
import { useDeveloperStore } from "@/store/developerStore";
import { toast } from "sonner";

interface GeneralSettingsTabProps {
  settings: DeveloperSettings;
}

export const GeneralSettingsTab = ({ settings }: GeneralSettingsTabProps) => {
  const { updateSettings } = useDeveloperStore();
  
  return (
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
  );
};
