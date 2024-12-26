import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SettingsFormProps {
  settings: {
    business_phone: string;
    api_key: string;
    account_id: string;
    whatsapp_number_id: string;
    callback_url: string;
  };
  onSettingsChange: (settings: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onTestConnection: () => void;
}

export const SettingsForm = ({
  settings,
  onSettingsChange,
  onSubmit,
  onTestConnection,
}: SettingsFormProps) => {
  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ ...settings, [field]: e.target.value });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>رقم الواتساب</Label>
        <Input
          value={settings.business_phone}
          onChange={handleChange("business_phone")}
          placeholder="966500000000"
          dir="ltr"
          className="text-left"
        />
      </div>
      
      <div className="space-y-2">
        <Label>مفتاح API</Label>
        <Input
          value={settings.api_key}
          onChange={handleChange("api_key")}
          type="password"
          placeholder="أدخل مفتاح API"
          dir="ltr"
          className="text-left"
        />
      </div>

      <div className="space-y-2">
        <Label>معرف الحساب</Label>
        <Input
          value={settings.account_id}
          onChange={handleChange("account_id")}
          placeholder="أدخل معرف الحساب"
          dir="ltr"
          className="text-left"
        />
      </div>

      <div className="space-y-2">
        <Label>معرف رقم الواتساب</Label>
        <Input
          value={settings.whatsapp_number_id}
          onChange={handleChange("whatsapp_number_id")}
          placeholder="أدخل معرف رقم الواتساب"
          dir="ltr"
          className="text-left"
        />
      </div>

      <div className="space-y-2">
        <Label>رابط Callback (اختياري)</Label>
        <Input
          value={settings.callback_url}
          onChange={handleChange("callback_url")}
          placeholder="https://example.com/webhook"
          dir="ltr"
          className="text-left"
        />
      </div>

      <div className="flex justify-between space-x-4 space-x-reverse">
        <Button type="submit">حفظ الإعدادات</Button>
        <Button type="button" variant="secondary" onClick={onTestConnection}>
          اختبار الاتصال
        </Button>
      </div>
    </form>
  );
};