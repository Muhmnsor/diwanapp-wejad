
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Paperclip, X } from "lucide-react";
import { MentionInput } from "../mentions/MentionInput";

interface CommentFormProps {
  onSubmit: () => Promise<void>;
  text: string;
  onTextChange: (text: string) => void;
  selectedFile: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileRemove: () => void;
  isSubmitting: boolean;
  workspaceId?: string | null;
  placeholder?: string;
  inputId?: string;
  submitLabel?: string;
}

export const CommentForm = ({
  onSubmit,
  text,
  onTextChange,
  selectedFile,
  onFileChange,
  onFileRemove,
  isSubmitting,
  workspaceId,
  placeholder = "أضف تعليقك حول المهمة...",
  inputId = "comment-file",
  submitLabel = "تعليق"
}: CommentFormProps) => {
  // تعديل معالج تغيير الملف لإضافة تصنيف "comment" للملف
  const handleFileChangeWithCategory = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // إضافة وصف التصنيف للملف
      const file = e.target.files[0];
      // TypeScript doesn't allow direct properties assignment to File objects
      // We can use a workaround with Object.defineProperty if needed
      const fileWithCategory = Object.assign(file, { category: 'comment' });
      onFileChange({ ...e, target: { ...e.target, files: [fileWithCategory] } } as any);
    } else {
      onFileChange(e);
    }
  };

  return (
    <div className="flex gap-2 w-full">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 w-full">
        <div className="relative">
          <MentionInput 
            value={text}
            onChange={onTextChange}
            placeholder={placeholder}
            workspaceId={workspaceId}
            isSubmitting={isSubmitting}
          />
          <div className="absolute left-2 bottom-2">
            <input type="file" id={inputId} className="hidden" onChange={handleFileChangeWithCategory} accept="image/*,.pdf,.docx,.xlsx" />
            <Button type="button" variant="ghost" size="sm" className="h-6 hover:bg-accent/10 rounded-full" onClick={() => document.getElementById(inputId)?.click()}>
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="flex gap-2 items-center">
            {selectedFile && <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span className="truncate max-w-[120px]">{selectedFile.name}</span>
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={onFileRemove}>
                  <X className="h-3 w-3" />
                </Button>
              </div>}
          </div>
          <Button onClick={onSubmit} disabled={isSubmitting || !text.trim()} className="rounded-full text-sm" size="sm">
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
