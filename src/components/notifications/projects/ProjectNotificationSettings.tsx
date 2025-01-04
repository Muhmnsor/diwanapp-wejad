import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ProjectNotificationSettingsProps {
  projectId: string;
}

export const ProjectNotificationSettings = ({ projectId }: ProjectNotificationSettingsProps) => {
  const [settings, setSettings] = useState({
    registrationEnabled: true,
    activityReminderEnabled: true,
    feedbackEnabled: true,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('project_notification_settings')
          .select('*')
          .eq('project_id', projectId)
          .single();

        if (error) throw error;

        if (data) {
          setSettings({
            registrationEnabled: data.registration_enabled,
            activityReminderEnabled: data.activity_reminder_enabled,
            feedbackEnabled: data.feedback_enabled,
          });
        }
      } catch (err) {
        console.error('Error loading notification settings:', err);
        setError('حدث خطأ أثناء تحميل الإعدادات');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [projectId]);

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

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6 space-y-6">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <h3 className="text-lg font-semibold mb-4">إعدادات إشعارات المشروع</h3>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="registration" className="flex-1">إشعارات التسجيل</Label>
          <Switch
            id="registration"
            checked={settings.registrationEnabled}
            onCheckedChange={(value) => handleSettingChange('registration_enabled', value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="activityReminder" className="flex-1">إشعارات تذكير الأنشطة</Label>
          <Switch
            id="activityReminder"
            checked={settings.activityReminderEnabled}
            onCheckedChange={(value) => handleSettingChange('activity_reminder_enabled', value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="feedback" className="flex-1">إشعارات التغذية الراجعة</Label>
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