
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface NotificationTemplateSelectProps {
  notificationType: string;
  targetType: 'event' | 'project';
  value: string;
  onValueChange: (value: string) => void;
}

export const NotificationTemplateSelect = ({
  notificationType,
  targetType,
  value,
  onValueChange
}: NotificationTemplateSelectProps) => {
  const { data: templates, isLoading } = useQuery({
    queryKey: ['notification-templates', notificationType, targetType],
    queryFn: async () => {
      console.log('Fetching templates for:', { notificationType, targetType });
      
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .eq('notification_type', notificationType)
        .eq('target_type', targetType)
        .eq('status', 'active');

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="اختر قالب الرسالة" />
      </SelectTrigger>
      <SelectContent>
        {templates?.map((template) => (
          <SelectItem key={template.id} value={template.id}>
            {template.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
