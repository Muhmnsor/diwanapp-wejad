
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isSubmitting?: boolean;
  workspaceId?: string | null;
}

export const MentionInput = ({
  value,
  onChange,
  placeholder = "اكتب تعليقك هنا...",
  isSubmitting = false,
  // We add the workspaceId prop but don't use it since the mention feature was removed
  workspaceId
}: MentionInputProps) => {
  const [rows, setRows] = useState(1);
  
  // Function to enforce word limit
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputText = e.target.value;
    const wordCount = inputText.trim().split(/\s+/).filter(Boolean).length;
    
    // If word count exceeds 250, don't update the value
    if (wordCount <= 250) {
      onChange(inputText);
    }
  };
  
  // Adjust rows based on content
  useEffect(() => {
    if (!value) {
      setRows(1);
      return;
    }
    
    const lineCount = (value.match(/\n/g) || []).length + 1;
    // Cap at 5 visible rows max for better UX
    setRows(Math.min(Math.max(lineCount, 1), 5));
  }, [value]);

  return (
    <div className="relative w-full">
      <Textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="resize-none min-h-[40px] pr-8 text-right text-sm"
        dir="rtl"
        disabled={isSubmitting}
        rows={rows}
      />
      {value && (
        <div className="absolute bottom-1 left-2 text-xs text-muted-foreground">
          {value.trim().split(/\s+/).filter(Boolean).length}/250
        </div>
      )}
    </div>
  );
};
