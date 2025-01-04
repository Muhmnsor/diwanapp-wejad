import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EventNotificationSettingsProps {
  eventId: string;
}

export const EventNotificationSettings = ({ eventId }: EventNotificationSettingsProps) => {
  const [settings, setSettings] = useState({
    registrationEnabled: true,
    reminderEnabled: true,
    feedbackEnabled: true,
    certificateEnabled: false,
  });

  const handleSettingChange = async (setting: string, value: boolean) => {
    console.log('Updating notification setting:', { setting, value });
    
    try {
      const { error } = await supabase
        .from('event_notification_settings')
        .upsert({
          event_id: eventId,
          [setting]: value,
        });

      if (error) throw error;
      
      setSettings(prev => ({ ...prev, [setting]: value }));
      toast.success('تم تحديث الإعدادات بنجاح');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error('حدث خطأ أثناء تحديث الإعدادات');
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <h3 className="text-lg font-semibold mb-4">إعدادات الإشعارات</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="registration">إشعارات التسجيل</Label>
          <Switch
            id="registration"
            checked={settings.registrationEnabled}
            onCheckedChange={(value) => handleSettingChange('registration_enabled', value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="reminder">إشعارات التذكير</Label>
          <Switch
            id="reminder"
            checked={settings.reminderEnabled}
            onCheckedChange={(value) => handleSettingChange('reminder_enabled', value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="feedback">إشعارات التغذية الراجعة</Label>
          <Switch
            id="feedback"
            checked={settings.feedbackEnabled}
            onCheckedChange={(value) => handleSettingChange('feedback_enabled', value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="certificate">إشعارات الشهادات</Label>
          <Switch
            id="certificate"
            checked={settings.certificateEnabled}
            onCheckedChange={(value) => handleSettingChange('certificate_enabled', value)}
          />
        </div>
      </div>
    </Card>
  );
};