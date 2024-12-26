import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TemplateForm } from "./TemplateForm";

interface TemplateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  content: string;
  onNameChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
}

export const TemplateDialog = ({
  isOpen,
  onOpenChange,
  name,
  content,
  onNameChange,
  onContentChange,
  onSubmit,
  isEditing,
}: TemplateDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "تعديل قالب" : "إضافة قالب جديد"}
          </DialogTitle>
        </DialogHeader>
        <TemplateForm
          name={name}
          content={content}
          onNameChange={onNameChange}
          onContentChange={onContentChange}
          onSubmit={onSubmit}
          isEditing={isEditing}
        />
      </DialogContent>
    </Dialog>
  );
};