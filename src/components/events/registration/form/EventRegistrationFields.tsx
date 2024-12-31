import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface EventRegistrationFieldsProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    arabicName: string;
    englishName?: string;
    educationLevel?: string;
    birthDate?: string;
    nationalId?: string;
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  projectPrice: number | "free" | null;
}

export const EventRegistrationFields = ({
  formData,
  setFormData,
  projectPrice,
}: EventRegistrationFieldsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="arabicName">الاسم بالعربي</Label>
        <Input
          id="arabicName"
          value={formData.arabicName}
          onChange={(e) =>
            setFormData((prev: any) => ({ ...prev, arabicName: e.target.value }))
          }
          placeholder="أدخل اسمك بالعربي"
          required
        />
      </div>

      <div>
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev: any) => ({ ...prev, email: e.target.value }))
          }
          placeholder="أدخل بريدك الإلكتروني"
          required
        />
      </div>

      <div>
        <Label htmlFor="phone">رقم الجوال</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) =>
            setFormData((prev: any) => ({ ...prev, phone: e.target.value }))
          }
          placeholder="أدخل رقم جوالك"
          required
        />
      </div>

      {projectPrice !== "free" && projectPrice !== null && projectPrice > 0 && (
        <>
          <div>
            <Label htmlFor="cardNumber">رقم البطاقة</Label>
            <Input
              id="cardNumber"
              value={formData.cardNumber}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  cardNumber: e.target.value,
                }))
              }
              placeholder="أدخل رقم البطاقة"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiryDate">تاريخ الانتهاء</Label>
              <Input
                id="expiryDate"
                value={formData.expiryDate}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    expiryDate: e.target.value,
                  }))
                }
                placeholder="MM/YY"
                required
              />
            </div>

            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                value={formData.cvv}
                onChange={(e) =>
                  setFormData((prev: any) => ({ ...prev, cvv: e.target.value }))
                }
                placeholder="123"
                required
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};