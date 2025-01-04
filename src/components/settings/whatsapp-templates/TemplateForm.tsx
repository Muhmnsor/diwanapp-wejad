import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TemplateFormProps {
  name: string;
  content: string;
  templateType: string;
  notificationType: string;
  targetType: string;
  onNameChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onTemplateTypeChange: (value: string) => void;
  onNotificationTypeChange: (value: string) => void;
  onTargetTypeChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onPreview: () => void;
  isEditing: boolean;
  isLoading?: boolean;
}

export const TemplateForm = ({
  name,
  content,
  templateType,
  notificationType,
  targetType,
  onNameChange,
  onContentChange,
  onTemplateTypeChange,
  onNotificationTypeChange,
  onTargetTypeChange,
  onSubmit,
  onPreview,
  isEditing,
  isLoading
}: TemplateFormProps) => {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const placeholders = {
    event_registration: ['[اسم_المشترك]', '[اسم_الفعالية]', '[تاريخ_الفعالية]', '[وقت_الفعالية]', '[مكان_الفعالية]'],
    event_reminder: ['[اسم_المشترك]', '[اسم_الفعالية]', '[تاريخ_الفعالية]', '[وقت_الفعالية]'],
    event_feedback: ['[اسم_المشترك]', '[اسم_الفعالية]', '[رابط_الاستبيان]'],
    project_registration: ['[اسم_المشترك]', '[اسم_المشروع]', '[تاريخ_البداية]'],
    project_activity: ['[اسم_المشترك]', '[اسم_النشاط]', '[تاريخ_النشاط]', '[وقت_النشاط]']
  };

  const validateTemplate = async () => {
    setIsValidating(true);
    setValidationError(null);

    try {
      console.log('Validating template:', { content });
      
      const { data, error } = await supabase.functions.invoke('validate-template', {
        body: {
          template: content,
          variables: {
            اسم_المشترك: 'محمد أحمد',
            اسم_الفعالية: 'فعالية تجريبية',
            تاريخ_الفعالية: '2024-03-20',
            وقت_الفعالية: '14:00',
            مكان_الفعالية: 'قاعة الاجتماعات'
          }
        }
      });

      if (error) throw error;

      if (!data.isValid) {
        setValidationError(`المتغيرات المفقودة: ${data.missingVariables.join(', ')}`);
        toast.error('يوجد متغيرات مفقودة في القالب');
      } else {
        toast.success('تم التحقق من صحة القالب بنجاح');
      }

      console.log('Validation result:', data);
    } catch (error) {
      console.error('Error validating template:', error);
      setValidationError('حدث خطأ أثناء التحقق من صحة القالب');
      toast.error('حدث خطأ أثناء التحقق من صحة القالب');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate template before submitting
    await validateTemplate();
    
    if (!validationError) {
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>اسم القالب</Label>
          <Input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="أدخل اسم القالب"
            className="text-right"
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>نوع القالب</Label>
            <Select
              value={templateType}
              onValueChange={onTemplateTypeChange}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع القالب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">مخصص</SelectItem>
                <SelectItem value="default">افتراضي</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>نوع الإشعار</Label>
            <Select
              value={notificationType}
              onValueChange={onNotificationTypeChange}
              disabled={isLoading}
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
        </div>

        <div className="space-y-2">
          <Label>نوع الهدف</Label>
          <Select
            value={targetType}
            onValueChange={onTargetTypeChange}
            disabled={isLoading}
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
              {placeholders[notificationType as keyof typeof placeholders]?.join(', ')}
            </AlertDescription>
          </Alert>
          <Textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="أدخل محتوى الرسالة"
            rows={5}
            className="text-right"
            dir="rtl"
            disabled={isLoading}
          />
          {validationError && (
            <Alert variant="destructive">
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}
        </div>

        {content && (
          <Card className="p-4">
            <div className="space-y-2">
              <Label>معاينة الرسالة</Label>
              <div className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                {content}
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline"
          onClick={validateTemplate}
          disabled={isLoading || !content || isValidating}
        >
          {isValidating ? 'جاري التحقق...' : 'تحقق من القالب'}
        </Button>
        <Button 
          type="button" 
          variant="outline"
          onClick={onPreview}
          disabled={isLoading || !content || isValidating}
        >
          معاينة
        </Button>
        <Button 
          type="submit"
          disabled={isLoading || isValidating}
        >
          {isLoading ? 'جاري الحفظ...' : isEditing ? 'تحديث' : 'إضافة'}
        </Button>
      </div>
    </form>
  );
};