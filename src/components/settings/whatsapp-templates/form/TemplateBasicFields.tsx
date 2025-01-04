import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TemplateBasicFieldsProps {
  name: string;
  templateType: string;
  notificationType: string;
  targetType: string;
  onNameChange: (value: string) => void;
  onTemplateTypeChange: (value: string) => void;
  onNotificationTypeChange: (value: string) => void;
  onTargetTypeChange: (value: string) => void;
  isLoading?: boolean;
}

export const TemplateBasicFields = ({
  name,
  templateType,
  notificationType,
  targetType,
  onNameChange,
  onTemplateTypeChange,
  onNotificationTypeChange,
  onTargetTypeChange,
  isLoading
}: TemplateBasicFieldsProps) => {
  return (
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
    </div>
  );
};