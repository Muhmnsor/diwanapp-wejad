
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bug } from "lucide-react";
import { useDeveloperStore } from "@/store/developerStore";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export const DebugSettings = () => {
  const { settings, updateSettings } = useDeveloperStore();
  
  const handleCreateDebugLog = () => {
    console.log("Creating debug log at level:", settings?.debug_level);
    console.debug("Debug information dump:", {
      settings,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
    toast.success("تم إنشاء سجل تصحيح");
  };
  
  if (!settings) return null;
  
  return (
    <div className="space-y-4">
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
          
          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-2">
              <Checkbox id="verbose-logging" />
              <div>
                <Label htmlFor="verbose-logging">تسجيل مفصل</Label>
                <p className="text-sm text-muted-foreground">تسجيل تفاصيل إضافية في سجلات النظام</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox id="console-logging" />
              <div>
                <Label htmlFor="console-logging">تسجيل في وحدة التحكم</Label>
                <p className="text-sm text-muted-foreground">عرض جميع سجلات التصحيح في وحدة تحكم المتصفح</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox id="network-logging" />
              <div>
                <Label htmlFor="network-logging">تسجيل طلبات الشبكة</Label>
                <p className="text-sm text-muted-foreground">تسجيل تفاصيل طلبات واستجابات API</p>
              </div>
            </div>
          </div>
          
          <Button className="w-full mt-4" onClick={handleCreateDebugLog}>
            <Bug className="h-4 w-4 ml-2" />
            إنشاء سجل تصحيح
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
