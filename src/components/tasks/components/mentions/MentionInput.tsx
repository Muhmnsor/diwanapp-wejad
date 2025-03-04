
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
  return (
    <div className="relative w-full">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="resize-none min-h-[100px] pr-8 text-right"
        dir="rtl"
        disabled={isSubmitting}
      />
    </div>
  );
};
