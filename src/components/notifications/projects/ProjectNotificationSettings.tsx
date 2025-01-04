import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ProjectNotificationSettingsProps {
  projectId: string;
}

export const ProjectNotificationSettings = ({ projectId }: ProjectNotificationSettingsProps) => {
  const [settings, setSettings] = useState({
    registrationEnabled: true,
    activityReminderEnabled: true,
    feedbackEnabled: true,
  });

  const handleSettingChange = async (setting: string, value: boolean) => {
    console.log('Updating project notification setting:', { setting, value });
    
    try {
      const { error } = await supabase
        .from('project_notification_settings')
        .upsert({
          project_id: projectId,
          [setting]: value,
        });

      if (error) throw error;
      
      setSettings(prev => ({ ...prev, [setting]: value }));
      toast.success('تم تحديث الإعدادات بنجاح');
    } catch (error) {
      console.error('Error updating project notification settings:', error);
      toast.error('حدث خطأ أثناء تحديث الإعدادات');
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <h3 className="text-lg font-semibold mb-4">إعدادات إشعارات المشروع</h3>
      
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
          <Label htmlFor="activityReminder">إشعارات تذكير الأنشطة</Label>
          <Switch
            id="activityReminder"
            checked={settings.activityReminderEnabled}
            onCheckedChange={(value) => handleSettingChange('activity_reminder_enabled', value)}
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
      </div>
    </Card>
  );
};