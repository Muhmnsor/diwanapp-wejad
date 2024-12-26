import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SettingsFormProps {
  businessPhone: string;
  apiKey: string;
  onBusinessPhoneChange: (value: string) => void;
  onApiKeyChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const SettingsForm = ({
  businessPhone,
  apiKey,
  onBusinessPhoneChange,
  onApiKeyChange,
  onSubmit,
}: SettingsFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>رقم الواتساب</Label>
        <Input
          value={businessPhone}
          onChange={(e) => onBusinessPhoneChange(e.target.value)}
          placeholder="966500000000"
          dir="ltr"
          className="text-left"
        />
      </div>
      <div className="space-y-2">
        <Label>مفتاح API</Label>
        <Input
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          type="password"
          placeholder="أدخل مفتاح API"
          dir="ltr"
          className="text-left"
        />
      </div>
      <Button type="submit">حفظ الإعدادات</Button>
    </form>
  );
};