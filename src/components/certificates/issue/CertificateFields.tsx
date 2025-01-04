import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface CertificateFieldsProps {
  certificateData: Record<string, string>;
  onFieldChange: (key: string, value: string) => void;
}

export const CertificateFields = ({ certificateData, onFieldChange }: CertificateFieldsProps) => {
  return (
    <div className="space-y-4">
      {Object.entries(certificateData).map(([key, value]) => (
        <div key={key} className="space-y-2">
          <Label>{key}</Label>
          <Input
            value={value}
            onChange={(e) => onFieldChange(key, e.target.value)}
            placeholder={`أدخل ${key}`}
          />
        </div>
      ))}
    </div>
  );
};