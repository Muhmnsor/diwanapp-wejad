import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface TemplateEditorProps {
  initialTemplate?: {
    id: string;
    name: string;
    content: string;
    notification_type: string;
    target_type: string;
  };
  onSave: () => void;
  onCancel: () => void;
}

export const TemplateEditor = ({ initialTemplate, onSave, onCancel }: TemplateEditorProps) => {
  const [template, setTemplate] = useState({
    name: initialTemplate?.name || '',
    content: initialTemplate?.content || '',
    notification_type: initialTemplate?.notification_type || 'event_registration',
    target_type: initialTemplate?.target_type || 'event',
    language: 'ar'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving template:', template);

    try {
      setIsSubmitting(true);
      const { error } = initialTemplate?.id 
        ? await supabase
            .from('whatsapp_templates')
            .update(template)
            .eq('id', initialTemplate.id)
        : await supabase
            .from('whatsapp_templates')
            .insert([template]);

      if (error) throw error;
      
      toast.success('تم حفظ القالب بنجاح');
      onSave();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('حدث خطأ أثناء حفظ القالب');
    } finally {
      setIsSubmitting(false);
    }
  };

  const placeholders = {
    event_registration: ['[اسم_المشترك]', '[اسم_الفعالية]', '[تاريخ_الفعالية]', '[وقت_الفعالية]', '[مكان_الفعالية]'],
    event_reminder: ['[اسم_المشترك]', '[اسم_الفعالية]', '[تاريخ_الفعالية]', '[وقت_الفعالية]'],
    event_feedback: ['[اسم_المشترك]', '[اسم_الفعالية]', '[رابط_الاستبيان]'],
    project_registration: ['[اسم_المشترك]', '[اسم_المشروع]', '[تاريخ_البداية]'],
    project_activity: ['[اسم_المشترك]', '[اسم_النشاط]', '[تاريخ_النشاط]', '[وقت_النشاط]']
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>اسم القالب</Label>
        <Input
          value={template.name}
          onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
          placeholder="أدخل اسم القالب"
          className="text-right"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>نوع الإشعار</Label>
        <Select
          value={template.notification_type}
          onValueChange={(value) => setTemplate(prev => ({ ...prev, notification_type: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر نوع الإشعار" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="event_registration">تسجيل في فعالية</SelectItem>
            <SelectItem value="event_reminder">تذكير بفعالية</SelectItem>
            <SelectItem value="event_feedback">تغذية راجعة للفعالية</SelectItem>
            <SelectItem value="project_registration">تسجيل في مشروع</SelectItem>
            <SelectItem value="project_activity">نشاط مشروع</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>نوع الهدف</Label>
        <Select
          value={template.target_type}
          onValueChange={(value) => setTemplate(prev => ({ ...prev, target_type: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر نوع الهدف" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="event">فعالية</SelectItem>
            <SelectItem value="project">مشروع</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>محتوى الرسالة</Label>
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            المتغيرات المتاحة:{' '}
            {placeholders[template.notification_type as keyof typeof placeholders]?.join(', ')}
          </AlertDescription>
        </Alert>
        <Textarea
          value={template.content}
          onChange={(e) => setTemplate(prev => ({ ...prev, content: e.target.value }))}
          placeholder="أدخل محتوى الرسالة"
          rows={5}
          className="text-right"
          required
          dir="rtl"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'جاري الحفظ...' : initialTemplate ? 'تحديث' : 'إضافة'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          إلغاء
        </Button>
      </div>
    </form>
  );
};