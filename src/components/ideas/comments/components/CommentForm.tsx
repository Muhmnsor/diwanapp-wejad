
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { User, Paperclip, X } from "lucide-react";

interface CommentFormProps {
  onSubmit: () => Promise<void>;
  text: string;
  onTextChange: (text: string) => void;
  selectedFile: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileRemove: () => void;
  isSubmitting: boolean;
  onFocus?: () => void;
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
  onFocus,
  placeholder = "شارك برأيك...",
  inputId = "comment-file",
  submitLabel = "تعليق"
}: CommentFormProps) => {
  return <div className="flex gap-2 w-full">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 w-full">
        <Textarea 
          placeholder={placeholder} 
          value={text} 
          onChange={e => onTextChange(e.target.value)} 
          onFocus={onFocus} 
          className="min-h-[80px] w-full resize-none border rounded-2xl focus-visible:ring-0 text-right px-[23px] py-4" 
        />
        <div className="flex justify-between items-center mt-2">
          <div className="flex gap-2 items-center">
            <input type="file" id={inputId} className="hidden" onChange={onFileChange} accept="image/*,.pdf,.docx,.xlsx" />
            <Button type="button" variant="ghost" size="sm" className="h-8" onClick={() => document.getElementById(inputId)?.click()}>
              <Paperclip className="h-4 w-4 ml-1" />
              إضافة مرفق
            </Button>
            {selectedFile && <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>{selectedFile.name}</span>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onFileRemove}>
                  <X className="h-4 w-4" />
                </Button>
              </div>}
          </div>
          <Button onClick={onSubmit} disabled={isSubmitting || !text.trim()} className="rounded-full" size="sm">
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>;
};
