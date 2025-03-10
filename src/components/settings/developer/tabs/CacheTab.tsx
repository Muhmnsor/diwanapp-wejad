
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Clock, Database, RefreshCw } from "lucide-react";
import { DeveloperSettings } from "@/types/developer";
import { useDeveloperStore } from "@/store/developerStore";
import { toast } from "sonner";

interface CacheTabProps {
  settings: DeveloperSettings;
}

export const CacheTab = ({ settings }: CacheTabProps) => {
  const { updateSettings } = useDeveloperStore();
  
  return (
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
  );
};
