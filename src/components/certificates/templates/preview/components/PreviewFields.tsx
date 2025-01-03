import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PreviewFieldsProps {
  fields: Record<string, string>;
  previewData: Record<string, string>;
  onFieldChange: (key: string, value: string) => void;
}

export const PreviewFields = ({ fields, previewData, onFieldChange }: PreviewFieldsProps) => {
  return (
    <div className="grid gap-4">
      {Object.entries(fields).map(([key, value]) => (
        <div key={key}>
          <Label>{value as string}</Label>
          <Input
            value={previewData[key] || ''}
            onChange={(e) => onFieldChange(key, e.target.value)}
            placeholder={`أدخل ${value as string}`}
          />
        </div>
      ))}
    </div>
  );
};