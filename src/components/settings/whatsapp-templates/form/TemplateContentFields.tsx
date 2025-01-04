import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TemplateVariables } from "./components/TemplateVariables";
import { ValidationResult } from "./components/ValidationResult";

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
        <TemplateVariables 
          notificationType={notificationType} 
          placeholders={placeholders} 
        />
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
            <ValidationResult validationResult={validationResult} />
          )}
        </>
      )}
    </div>
  );
};