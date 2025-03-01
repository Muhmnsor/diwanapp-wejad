
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { User, Paperclip, X, Clock } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

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
  isDiscussionActive?: boolean;
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
  submitLabel = "تعليق",
  isDiscussionActive = true
}: CommentFormProps) => {
  if (!isDiscussionActive) {
    return (
      <Alert variant="destructive" className="bg-amber-50 border-amber-300 text-amber-800">
        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
        <AlertTitle className="text-amber-800 mr-2 text-sm sm:text-base">انتهت فترة المناقشة</AlertTitle>
        <AlertDescription className="text-amber-700 mr-2 text-xs sm:text-sm">
          اطلب تمديد فترة المناقشة من صاحب الصلاحية
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex gap-1 sm:gap-2 w-full">
      <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
        <AvatarFallback>
          <User className="h-3 w-3 sm:h-4 sm:w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 w-full">
        <div className="relative">
          <Textarea 
            placeholder={placeholder} 
            value={text} 
            onChange={e => onTextChange(e.target.value)} 
            onFocus={onFocus} 
            className="min-h-[60px] sm:min-h-[80px] w-full resize-none border rounded-xl sm:rounded-2xl focus-visible:ring-0 text-right px-[18px] sm:px-[23px] py-3 sm:py-4 pr-[40px] sm:pr-[50px]" 
          />
          <div className="absolute left-2 sm:left-3 bottom-2 sm:bottom-3">
            <input type="file" id={inputId} className="hidden" onChange={onFileChange} accept="image/*,.pdf,.docx,.xlsx" />
            <Button type="button" variant="ghost" size="sm" className="h-6 sm:h-8 hover:bg-accent/10 rounded-full" onClick={() => document.getElementById(inputId)?.click()}>
              <Paperclip className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center mt-1 sm:mt-2">
          <div className="flex gap-1 sm:gap-2 items-center">
            {selectedFile && <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                <span className="truncate max-w-[120px] sm:max-w-full">{selectedFile.name}</span>
                <Button variant="ghost" size="sm" className="h-5 w-5 sm:h-6 sm:w-6 p-0" onClick={onFileRemove}>
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>}
          </div>
          <Button onClick={onSubmit} disabled={isSubmitting || !text.trim()} className="rounded-full text-xs sm:text-sm" size="sm">
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
