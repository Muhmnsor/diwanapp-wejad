import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TemplateFormProps {
  name: string;
  content: string;
  onNameChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
}

export const TemplateForm = ({
  name,
  content,
  onNameChange,
  onContentChange,
  onSubmit,
  isEditing,
}: TemplateFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>اسم القالب</Label>
        <Input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="أدخل اسم القالب"
          className="text-right"
        />
      </div>
      <div className="space-y-2">
        <Label>محتوى الرسالة</Label>
        <Textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="أدخل محتوى الرسالة"
          rows={5}
          className="text-right"
        />
      </div>
      <Button type="submit" className="w-full">
        {isEditing ? "تحديث" : "إضافة"}
      </Button>
    </form>
  );
};