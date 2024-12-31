import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EventRegistrationFieldsProps {
  formData: {
    arabicName: string;
    englishName?: string;
    email: string;
    phone: string;
    educationLevel?: string;
    birthDate?: string;
    nationalId?: string;
    gender?: string;
    workStatus?: string;
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  projectPrice: number | "free" | null;
  registrationFields: {
    arabic_name: boolean;
    english_name: boolean;
    email: boolean;
    phone: boolean;
    education_level: boolean;
    birth_date: boolean;
    national_id: boolean;
    gender: boolean;
    work_status: boolean;
  };
}

export const EventRegistrationFields = ({
  formData,
  setFormData,
  projectPrice,
  registrationFields,
}: EventRegistrationFieldsProps) => {
  console.log('Registration fields config:', registrationFields);
  console.log('Current form data:', formData);

  return (
    <div className="space-y-4">
      {registrationFields.arabic_name && (
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
      )}

      {registrationFields.english_name && (
        <div>
          <Label htmlFor="englishName">الاسم بالإنجليزي</Label>
          <Input
            id="englishName"
            value={formData.englishName}
            onChange={(e) =>
              setFormData((prev: any) => ({ ...prev, englishName: e.target.value }))
            }
            placeholder="Enter your name in English"
          />
        </div>
      )}

      {registrationFields.email && (
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
      )}

      {registrationFields.phone && (
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
      )}

      {registrationFields.education_level && (
        <div>
          <Label htmlFor="educationLevel">المستوى التعليمي</Label>
          <Select
            value={formData.educationLevel}
            onValueChange={(value) =>
              setFormData((prev: any) => ({ ...prev, educationLevel: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر المستوى التعليمي" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">ابتدائي</SelectItem>
              <SelectItem value="intermediate">متوسط</SelectItem>
              <SelectItem value="high_school">ثانوي</SelectItem>
              <SelectItem value="bachelor">بكالوريوس</SelectItem>
              <SelectItem value="master">ماجستير</SelectItem>
              <SelectItem value="phd">دكتوراه</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {registrationFields.birth_date && (
        <div>
          <Label htmlFor="birthDate">تاريخ الميلاد</Label>
          <Input
            id="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={(e) =>
              setFormData((prev: any) => ({ ...prev, birthDate: e.target.value }))
            }
          />
        </div>
      )}

      {registrationFields.national_id && (
        <div>
          <Label htmlFor="nationalId">رقم الهوية</Label>
          <Input
            id="nationalId"
            value={formData.nationalId}
            onChange={(e) =>
              setFormData((prev: any) => ({ ...prev, nationalId: e.target.value }))
            }
            placeholder="أدخل رقم الهوية"
          />
        </div>
      )}

      {registrationFields.gender && (
        <div>
          <Label htmlFor="gender">الجنس</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) =>
              setFormData((prev: any) => ({ ...prev, gender: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الجنس" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">ذكر</SelectItem>
              <SelectItem value="female">أنثى</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {registrationFields.work_status && (
        <div>
          <Label htmlFor="workStatus">الحالة الوظيفية</Label>
          <Select
            value={formData.workStatus}
            onValueChange={(value) =>
              setFormData((prev: any) => ({ ...prev, workStatus: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الحالة الوظيفية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employed">موظف</SelectItem>
              <SelectItem value="unemployed">غير موظف</SelectItem>
              <SelectItem value="student">طالب</SelectItem>
              <SelectItem value="retired">متقاعد</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

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