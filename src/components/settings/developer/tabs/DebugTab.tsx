
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bug } from "lucide-react";
import { DeveloperSettings } from "@/types/developer";
import { useDeveloperStore } from "@/store/developerStore";
import { toast } from "sonner";

interface DebugTabProps {
  settings: DeveloperSettings;
}

export const DebugTab = ({ settings }: DebugTabProps) => {
  const { updateSettings } = useDeveloperStore();
  
  return (
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
  );
};
