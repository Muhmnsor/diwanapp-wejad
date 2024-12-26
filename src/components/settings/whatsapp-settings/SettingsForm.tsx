import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

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
            رقم الواتساب الخاص بحسابك التجاري
          </p>
        </div>
        
        <div className="space-y-2">
          <Label>مفتاح API</Label>
          <Input
            value={settings.api_key}
            onChange={handleChange("api_key")}
            type="password"
            placeholder="أدخل مفتاح API"
            dir="ltr"
            className="text-left font-mono"
          />
          <p className="text-sm text-muted-foreground">
            مفتاح API الخاص بحساب الواتساب
          </p>
        </div>

        <div className="space-y-2">
          <Label>معرف الحساب</Label>
          <Input
            value={settings.account_id}
            onChange={handleChange("account_id")}
            placeholder="أدخل معرف الحساب"
            dir="ltr"
            className="text-left font-mono"
          />
          <p className="text-sm text-muted-foreground">
            معرف حساب الواتساب الخاص بك
          </p>
        </div>

        <div className="space-y-2">
          <Label>معرف رقم الواتساب</Label>
          <Input
            value={settings.whatsapp_number_id}
            onChange={handleChange("whatsapp_number_id")}
            placeholder="أدخل معرف رقم الواتساب"
            dir="ltr"
            className="text-left font-mono"
          />
          <p className="text-sm text-muted-foreground">
            معرف رقم الواتساب المرتبط بحسابك
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
        </div>
      </div>
    </form>
  );
};