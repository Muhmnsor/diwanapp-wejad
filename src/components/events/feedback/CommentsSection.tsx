import { Textarea } from "@/components/ui/textarea";

interface CommentsSectionProps {
  value: string;
  onChange: (value: string) => void;
}

export const CommentsSection = ({ value, onChange }: CommentsSectionProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">ملاحظات إضافية</label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="اكتب ملاحظاتك هنا"
        className="h-32 bg-white"
      />
    </div>
  );
};