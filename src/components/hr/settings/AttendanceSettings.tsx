import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AttendanceSetting {
  id: string;
  name: string;
  value: string;
  description: string | null;
}

export function AttendanceSettings() {
  const [settings, setSettings] = useState<AttendanceSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("hr_attendance_settings")
        .select("*");

      if (error) throw error;

      if (data && data.length > 0) {
        setSettings(data);
      } else {
        // If no settings exist, create default ones
        await createDefaultSettings();
        fetchSettings();
        return;
      }
    } catch (error) {
      console.error("Error fetching attendance settings:", error);
      toast({
        title: "خطأ في جلب إعدادات الحضور",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSettings = async () => {
    const defaultSettings = [
      {
        name: "late_threshold_minutes",
        value: "10",
        description: "الحد الأقصى للتأخير المسموح به (بالدقائق)",
      },
      {
        name: "early_departure_threshold_minutes",
        value: "10",
        description: "الحد الأقصى للمغادرة المبكرة المسموح بها (بالدقائق)",
      },
      {
        name: "auto_check_out_enabled",
        value: "false",
        description: "تسجيل الخروج التلقائي عند انتهاء الدوام",
      },
      {
        name: "track_breaks",
        value: "false",
        description: "تتبع استراحات الموظفين",
      },
      {
        name: "lunch_break_duration",
        value: "60",
        description: "مدة استراحة الغداء (بالدقائق)",
      },
    ];

    await supabase.from("hr_attendance_settings").insert(defaultSettings);
  };

  const handleSettingChange = (index: number, value: string) => {
    const newSettings = [...settings];
    newSettings[index].value = value;
    setSettings(newSettings);
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // Update all settings at once with upsert
      const { error } = await supabase
        .from("hr_attendance_settings")
        .upsert(settings);
        
      if (error) throw error;
      
      toast({
        title: "تم حفظ الإعدادات بنجاح",
      });
    } catch (error) {
      console.error("Error saving attendance settings:", error);
      toast({
        title: "خطأ في حفظ الإعدادات",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">جاري تحميل الإعدادات...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>إعدادات الحضور والانصراف</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {settings.map((setting, index) => (
          <div key={setting.id} className="grid gap-2">
            <Label htmlFor={`setting-${setting.id}`}>
              {setting.description}
            </Label>
            
            {setting.name.includes("enabled") || setting.name.includes("track") ? (
              <Switch
                id={`setting-${setting.id}`}
                checked={setting.value === "true"}
                onCheckedChange={(checked) => 
                  handleSettingChange(index, checked ? "true" : "false")
                }
              />
            ) : (
              <Input
                id={`setting-${setting.id}`}
                type="number"
                value={setting.value}
                onChange={(e) => handleSettingChange(index, e.target.value)}
              />
            )}
          </div>
        ))}
        
        <Button 
          onClick={handleSaveSettings} 
          disabled={saving}
          className="mt-4"
        >
          {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </Button>
      </CardContent>
    </Card>
  );
}
