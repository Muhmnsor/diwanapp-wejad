import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WhatsAppSettings {
  business_phone: string;
  api_key: string;
  account_id: string;
  whatsapp_number_id: string;
  callback_url: string;
}

interface SettingsFormProps {
  settings: WhatsAppSettings;
  onSettingsChange: (settings: WhatsAppSettings) => void;
  onSubmit: (e: React.FormEvent) => void;
  onTestConnection: () => void;
  onSendTestMessage: () => void;
}

export const SettingsForm = ({
  settings,
  onSettingsChange,
  onSubmit,
  onTestConnection,
  onSendTestMessage,
}: SettingsFormProps) => {
  const handleChange = (field: keyof WhatsAppSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ ...settings, [field]: e.target.value });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6" dir="rtl">
      <div className="grid gap-6">
        <div className="space-y-2">
          <Label>رقم الواتساب</Label>
          <Input
            value={settings.business_phone}
            onChange={handleChange("business_phone")}
            placeholder="966500000000"
            dir="ltr"
            className="text-left"
          />
          <p className="text-sm text-muted-foreground">
            رقم الواتساب الخاص بحسابك التجاري على Interakt
          </p>
        </div>
        
        <div className="space-y-2">
          <Label>مفتاح API</Label>
          <Input
            value={settings.api_key}
            onChange={handleChange("api_key")}
            type="password"
            placeholder="أدخل مفتاح API الخاص بـ Interakt"
            dir="ltr"
            className="text-left font-mono"
          />
          <p className="text-sm text-muted-foreground">
            مفتاح API الخاص بحساب Interakt
          </p>
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
          <p className="text-sm text-muted-foreground">
            رابط Webhook لاستقبال التحديثات من الواتساب
          </p>
        </div>
      </div>

      <div className="flex justify-between space-x-4 rtl:space-x-reverse">
        <div className="space-x-4 rtl:space-x-reverse">
          <Button type="submit" size="lg">
            حفظ الإعدادات
          </Button>
          <Button 
            type="button" 
            variant="secondary" 
            size="lg"
            onClick={onTestConnection}
          >
            اختبار الاتصال
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="lg"
            onClick={onSendTestMessage}
          >
            إرسال رسالة تجريبية
          </Button>
        </div>
      </div>
    </form>
  );
};