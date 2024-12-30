import { Input } from "@/components/ui/input";

interface RegistrationFormInputsProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    arabic_name?: string;
    english_name?: string;
    education_level?: string;
    birth_date?: string;
    national_id?: string;
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
  };
  setFormData: (data: any) => void;
  eventPrice: number | "free" | null;
  showPaymentFields?: boolean;
}

export const RegistrationFormInputs = ({
  formData,
  setFormData,
  eventPrice,
  showPaymentFields = false
}: RegistrationFormInputsProps) => {
  return (
    <div className="space-y-4">
      {formData.arabic_name !== undefined && (
        <div>
          <label className="text-sm font-medium block mb-1.5">الاسم الثلاثي بالعربية</label>
          <Input
            value={formData.arabic_name || ""}
            onChange={(e) => setFormData({ ...formData, arabic_name: e.target.value })}
            className="text-right"
            required
          />
        </div>
      )}

      {formData.english_name !== undefined && (
        <div>
          <label className="text-sm font-medium block mb-1.5">الاسم الثلاثي بالإنجليزية</label>
          <Input
            value={formData.english_name || ""}
            onChange={(e) => setFormData({ ...formData, english_name: e.target.value })}
            className="text-right"
            required
          />
        </div>
      )}

      {formData.education_level !== undefined && (
        <div>
          <label className="text-sm font-medium block mb-1.5">المرحلة الدراسية</label>
          <Input
            value={formData.education_level || ""}
            onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
            className="text-right"
            required
          />
        </div>
      )}

      {formData.birth_date !== undefined && (
        <div>
          <label className="text-sm font-medium block mb-1.5">تاريخ الميلاد</label>
          <Input
            type="date"
            value={formData.birth_date || ""}
            onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
            className="text-right"
            required
          />
        </div>
      )}

      {formData.national_id !== undefined && (
        <div>
          <label className="text-sm font-medium block mb-1.5">رقم الهوية</label>
          <Input
            value={formData.national_id || ""}
            onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
            className="text-right"
            required
          />
        </div>
      )}

      <div>
        <label className="text-sm font-medium block mb-1.5">الاسم</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="text-right"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1.5">البريد الإلكتروني</label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="text-right"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1.5">رقم الجوال</label>
        <Input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="text-right"
          required
        />
      </div>

      {showPaymentFields && eventPrice !== "free" && eventPrice !== null && eventPrice > 0 && (
        <>
          <div>
            <label className="text-sm font-medium block mb-1.5">رقم البطاقة</label>
            <Input
              value={formData.cardNumber || ""}
              onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
              className="text-right"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">تاريخ الانتهاء</label>
            <Input
              value={formData.expiryDate || ""}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="text-right"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">رمز التحقق</label>
            <Input
              value={formData.cvv || ""}
              onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
              className="text-right"
              required
            />
          </div>
        </>
      )}
    </div>
  );
};