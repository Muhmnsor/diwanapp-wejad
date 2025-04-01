
import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save } from "lucide-react";

export function AttendanceSettings() {
  const [settings, setSettings] = useState({
    lateThresholdMinutes: 15,
    absenceThresholdMinutes: 120,
    allowPartialDays: true,
    trackBreaks: true,
    requireLocationVerification: false,
    earlyDepartureThresholdMinutes: 30,
    autoApproveAttendance: true,
    allowFlexTime: true,
    flexTimeRangeMinutes: 60,
  });

  const handleSaveSettings = () => {
    console.log("Saving attendance settings:", settings);
    toast.success("تم حفظ إعدادات الحضور بنجاح");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>إعدادات الحضور والانصراف</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lateThreshold">حد التأخير (بالدقائق)</Label>
                <Input
                  id="lateThreshold"
                  type="number"
                  value={settings.lateThresholdMinutes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      lateThresholdMinutes: parseInt(e.target.value) || 0,
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  عدد الدقائق التي تعتبر بعدها الموظف متأخراً
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="absenceThreshold">حد الغياب (بالدقائق)</Label>
                <Input
                  id="absenceThreshold"
                  type="number"
                  value={settings.absenceThresholdMinutes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      absenceThresholdMinutes: parseInt(e.target.value) || 0,
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  عدد الدقائق التي يعتبر بعدها الموظف غائباً
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="earlyDepartureThreshold">
                  حد الانصراف المبكر (بالدقائق)
                </Label>
                <Input
                  id="earlyDepartureThreshold"
                  type="number"
                  value={settings.earlyDepartureThresholdMinutes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      earlyDepartureThresholdMinutes:
                        parseInt(e.target.value) || 0,
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  عدد الدقائق التي يعتبر بعدها الانصراف مبكراً
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="flexTimeRange">
                  نطاق الوقت المرن (بالدقائق)
                </Label>
                <Input
                  id="flexTimeRange"
                  type="number"
                  value={settings.flexTimeRangeMinutes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      flexTimeRangeMinutes: parseInt(e.target.value) || 0,
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  عدد الدقائق المسموح بها قبل وبعد وقت الدوام الرسمي
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowPartialDays">السماح بالدوام الجزئي</Label>
                  <p className="text-sm text-muted-foreground">
                    السماح للموظفين بتسجيل دوام لجزء من اليوم
                  </p>
                </div>
                <Switch
                  id="allowPartialDays"
                  checked={settings.allowPartialDays}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, allowPartialDays: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="trackBreaks">تتبع فترات الراحة</Label>
                  <p className="text-sm text-muted-foreground">
                    تتبع أوقات الراحة خلال ساعات العمل
                  </p>
                </div>
                <Switch
                  id="trackBreaks"
                  checked={settings.trackBreaks}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, trackBreaks: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="requireLocationVerification">
                    التحقق من الموقع
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    طلب التحقق من موقع الموظف عند تسجيل الحضور
                  </p>
                </div>
                <Switch
                  id="requireLocationVerification"
                  checked={settings.requireLocationVerification}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      requireLocationVerification: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoApproveAttendance">
                    الموافقة التلقائية على الحضور
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    الموافقة تلقائياً على سجلات الحضور دون مراجعة
                  </p>
                </div>
                <Switch
                  id="autoApproveAttendance"
                  checked={settings.autoApproveAttendance}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, autoApproveAttendance: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowFlexTime">السماح بالوقت المرن</Label>
                  <p className="text-sm text-muted-foreground">
                    السماح للموظفين بالعمل ضمن نطاق زمني مرن
                  </p>
                </div>
                <Switch
                  id="allowFlexTime"
                  checked={settings.allowFlexTime}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, allowFlexTime: checked })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={handleSaveSettings} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              حفظ الإعدادات
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
