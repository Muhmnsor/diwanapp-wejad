import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TemplateForm } from "./TemplateForm";

interface TemplateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
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

export const TemplateDialog = ({
  isOpen,
  onOpenChange,
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
}: TemplateDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "تعديل قالب" : "إضافة قالب جديد"}
          </DialogTitle>
        </DialogHeader>

        <TemplateForm
          name={name}
          content={content}
          templateType={templateType}
          notificationType={notificationType}
          targetType={targetType}
          onNameChange={onNameChange}
          onContentChange={onContentChange}
          onTemplateTypeChange={onTemplateTypeChange}
          onNotificationTypeChange={onNotificationTypeChange}
          onTargetTypeChange={onTargetTypeChange}
          onSubmit={onSubmit}
          onPreview={onPreview}
          isEditing={isEditing}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};