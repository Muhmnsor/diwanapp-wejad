import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

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
  const placeholders = {
    event_registration: ['[اسم_المشترك]', '[اسم_الفعالية]', '[تاريخ_الفعالية]', '[وقت_الفعالية]', '[مكان_الفعالية]'],
    event_reminder: ['[اسم_المشترك]', '[اسم_الفعالية]', '[تاريخ_الفعالية]', '[وقت_الفعالية]'],
    event_feedback: ['[اسم_المشترك]', '[اسم_الفعالية]', '[رابط_الاستبيان]'],
    project_registration: ['[اسم_المشترك]', '[اسم_المشروع]', '[تاريخ_البداية]'],
    project_activity: ['[اسم_المشترك]', '[اسم_النشاط]', '[تاريخ_النشاط]', '[وقت_النشاط]']
  };

  return (
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
  );
};