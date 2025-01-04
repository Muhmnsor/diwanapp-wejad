import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TemplateBasicFields } from "./form/TemplateBasicFields";
import { TemplateContentFields } from "./form/TemplateContentFields";
import { TemplateFormActions } from "./form/TemplateFormActions";

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
    await validateTemplate();
    if (!validationError) {
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <TemplateBasicFields
        name={name}
        templateType={templateType}
        notificationType={notificationType}
        targetType={targetType}
        onNameChange={onNameChange}
        onTemplateTypeChange={onTemplateTypeChange}
        onNotificationTypeChange={onNotificationTypeChange}
        onTargetTypeChange={onTargetTypeChange}
        isLoading={isLoading}
      />

      <TemplateContentFields
        content={content}
        notificationType={notificationType}
        onContentChange={onContentChange}
        validationError={validationError}
        isLoading={isLoading}
      />

      <TemplateFormActions
        onValidate={validateTemplate}
        onPreview={onPreview}
        onSubmit={handleSubmit}
        isEditing={isEditing}
        isLoading={isLoading}
        isValidating={isValidating}
        content={content}
      />
    </form>
  );
};