import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RegistrationFormInputsProps {
  formData: {
    name: string;
    email: string;
    phone: string;
  };
  setFormData: (data: any) => void;
  eventPrice: number | "free";
}

export const RegistrationFormInputs = ({
  formData,
  setFormData,
  eventPrice,
}: RegistrationFormInputsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-right block">الاسم</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-right block">البريد الإلكتروني</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-right block">رقم الجوال</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
      </div>
      
      {eventPrice !== "free" && (
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-center mb-2">رسوم التسجيل: {eventPrice} ريال</p>
          <p className="text-sm text-muted-foreground text-center">
            سيتم تحويلك إلى صفحة الدفع بعد تأكيد التسجيل
          </p>
        </div>
      )}
    </div>
  );
};