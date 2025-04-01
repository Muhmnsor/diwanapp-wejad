
// src/components/hr/settings/AttendanceSettings.tsx

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Settings, Save, Clock } from "lucide-react";

interface AttendanceSetting {
  id: string;
  name: string;
  value: string;
  description: string;
}

export function AttendanceSettings() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch attendance settings
  const { data: attendanceSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["attendance-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hr_attendance_settings")
        .select("*");

      if (error) throw error;
      return data as AttendanceSetting[];
    },
  });

  // Initialize settings from fetched data
  useEffect(() => {
    if (attendanceSettings) {
      const settingsObj: Record<string, string> = {};
      attendanceSettings.forEach((setting) => {
        settingsObj[setting.name] = setting.value;
      });
      setSettings(settingsObj);
    }
  }, [attendanceSettings]);

  // Update settings
  const mutation = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      try {
        for (const setting of attendanceSettings || []) {
          if (settings[setting.name] !== setting.value) {
            const { error } = await supabase
              .from("hr_attendance_settings")
              .update({ value: settings[setting.name] })
              .eq("id", setting.id);

            if (error) throw error;
          }
        }
        return true;
      } catch (error) {
        console.error("Error saving attendance settings:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-settings"] });
      toast.success("تم حفظ إعدادات الحضور بنجاح");
    },
    onError: (error) => {
      console.error("Error:", error);
      toast.error("حدث خطأ أثناء حفظ إعدادات الحضور");
    },
  });

  const handleInputChange = (name: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getDayName = (dayOfWeek: string) => {
    const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    return days[parseInt(dayOfWeek)];
  };

  if (isLoadingSettings) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>جاري تحميل الإعدادات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          إعدادات الحضور والانصراف
        </h2>
        <Button 
          onClick={() => mutation.mutate()}
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          <Save className="h-4 w-4" />
          {isLoading ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إعدادات الحضور والمواعيد</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="tardiness_threshold_minutes">
                الحد الأقصى للتأخير (بالدقائق)
              </Label>
              <Input
                id="tardiness_threshold_minutes"
                type="number"
                min="0"
                value={settings.tardiness_threshold_minutes || ""}
                onChange={(e) => handleInputChange("tardiness_threshold_minutes", e.target.value)}
                placeholder="15"
              />
              <p className="text-xs text-muted-foreground">
                عدد الدقائق المسموح بها للتأخير قبل احتسابه كتأخير
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="early_departure_threshold_minutes">
                الحد الأقصى للمغادرة المبكرة (بالدقائق)
              </Label>
              <Input
                id="early_departure_threshold_minutes"
                type="number"
                min="0"
                value={settings.early_departure_threshold_minutes || ""}
                onChange={(e) => handleInputChange("early_departure_threshold_minutes", e.target.value)}
                placeholder="15"
              />
              <p className="text-xs text-muted-foreground">
                عدد الدقائق المسموح بها للمغادرة المبكرة قبل احتسابها
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grace_period_minutes">
                فترة السماح (بالدقائق)
              </Label>
              <Input
                id="grace_period_minutes"
                type="number"
                min="0"
                value={settings.grace_period_minutes || ""}
                onChange={(e) => handleInputChange("grace_period_minutes", e.target.value)}
                placeholder="5"
              />
              <p className="text-xs text-muted-foreground">
                فترة السماح بالدقائق قبل اعتبار الوقت متأخراً أو مبكراً
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="week_start_day">
                بداية الأسبوع
              </Label>
              <Select
                value={settings.week_start_day || "0"}
                onValueChange={(value) => handleInputChange("week_start_day", value)}
              >
                <SelectTrigger id="week_start_day">
                  <SelectValue placeholder="اختر يوم بداية الأسبوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">الأحد</SelectItem>
                  <SelectItem value="1">الاثنين</SelectItem>
                  <SelectItem value="2">الثلاثاء</SelectItem>
                  <SelectItem value="3">الأربعاء</SelectItem>
                  <SelectItem value="4">الخميس</SelectItem>
                  <SelectItem value="5">الجمعة</SelectItem>
                  <SelectItem value="6">السبت</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                اليوم الذي يبدأ فيه الأسبوع لحساب التقارير والإحصائيات
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.auto_approve_self_attendance === "true"}
                  onChange={(e) => handleInputChange("auto_approve_self_attendance", e.target.checked ? "true" : "false")}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span>الموافقة التلقائية على تسجيل الحضور الذاتي</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                إذا تم تفعيل هذا الخيار، سيتم الموافقة تلقائياً على تسجيلات الحضور الذاتية دون الحاجة لمراجعة المدير
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

