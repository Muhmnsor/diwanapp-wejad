import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TemplateContentFieldsProps {
  content: string;
  notificationType: string;
  onContentChange: (value: string) => void;
  validationError: string | null;
  isLoading?: boolean;
}

export const TemplateContentFields = ({
  content,
  notificationType,
  onContentChange,
  validationError,
  isLoading
}: TemplateContentFieldsProps) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    processedTemplate?: string;
    missingVariables?: string[];
  } | null>(null);

  const placeholders = {
    event_registration: ['[اسم_المشترك]', '[اسم_الفعالية]', '[تاريخ_الفعالية]', '[وقت_الفعالية]', '[مكان_الفعالية]'],
    event_reminder: ['[اسم_المشترك]', '[اسم_الفعالية]', '[تاريخ_الفعالية]', '[وقت_الفعالية]'],
    event_feedback: ['[اسم_المشترك]', '[اسم_الفعالية]', '[رابط_الاستبيان]'],
    project_registration: ['[اسم_المشترك]', '[اسم_المشروع]', '[تاريخ_البداية]'],
    project_activity: ['[اسم_المشترك]', '[اسم_النشاط]', '[تاريخ_النشاط]', '[وقت_النشاط]']
  };

  const validateTemplate = async () => {
    setIsValidating(true);
    try {
      console.log('Validating template content:', content);
      
      const { data, error } = await supabase.functions.invoke('validate-template', {
        body: {
          template: content,
          variables: {
            اسم_المشترك: 'محمد أحمد',
            اسم_الفعالية: 'فعالية تجريبية',
            تاريخ_الفعالية: '2024-03-20',
            وقت_الفعالية: '14:00',
            مكان_الفعالية: 'قاعة الاجتماعات',
            اسم_المشروع: 'مشروع تجريبي',
            تاريخ_البداية: '2024-03-20',
            اسم_النشاط: 'نشاط تجريبي',
            تاريخ_النشاط: '2024-03-20',
            وقت_النشاط: '14:00',
            رابط_الاستبيان: 'https://example.com/feedback'
          }
        }
      });

      if (error) throw error;
      
      setValidationResult(data);
      console.log('Template validation result:', data);
    } catch (error) {
      console.error('Error validating template:', error);
      setValidationResult({
        isValid: false,
        missingVariables: [],
        processedTemplate: 'حدث خطأ أثناء التحقق من صحة القالب'
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-4">
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
        <>
          <Button 
            variant="outline" 
            onClick={validateTemplate}
            disabled={isValidating || !content}
            className="w-full"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                جاري التحقق...
              </>
            ) : (
              'التحقق من صحة القالب'
            )}
          </Button>

          {validationResult && (
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label>نتيجة التحقق:</Label>
                  {validationResult.isValid ? (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle className="w-4 h-4" />
                      صحيح
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="w-4 h-4" />
                      يوجد أخطاء
                    </Badge>
                  )}
                </div>

                {!validationResult.isValid && validationResult.missingVariables?.length > 0 && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      المتغيرات المفقودة: {validationResult.missingVariables.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label>معاينة الرسالة:</Label>
                  <div className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                    {validationResult.processedTemplate || content}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
