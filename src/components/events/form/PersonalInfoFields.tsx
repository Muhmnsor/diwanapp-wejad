import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventPathType } from "@/types/event";

interface PersonalInfoFieldsProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    arabic_name?: string;
    english_name?: string;
    education_level?: string;
    birth_date?: string;
    national_id?: string;
    event_path?: EventPathType;
  };
  setFormData: (data: any) => void;
}

export const PersonalInfoFields = ({ formData, setFormData }: PersonalInfoFieldsProps) => {
  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    return value;
  };

  const handleEnglishInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    return value;
  };

  const handleEmailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9@._-]/g, '');
    return value;
  };

  return (
    <div className="space-y-4">
      {formData.national_id !== undefined && (
        <div>
          <label className="text-sm font-medium block mb-1.5 text-right">رقم الهوية</label>
          <Input
            value={formData.national_id || ""}
            onChange={(e) => setFormData({ ...formData, national_id: handleNumberInput(e) })}
            className="text-right"
            required
            maxLength={10}
            minLength={10}
            dir="ltr"
          />
        </div>
      )}

      {formData.arabic_name !== undefined && (
        <div>
          <label className="text-sm font-medium block mb-1.5 text-right">الاسم الثلاثي بالعربية</label>
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
          <label className="text-sm font-medium block mb-1.5 text-right">الاسم الثلاثي بالإنجليزية</label>
          <Input
            value={formData.english_name || ""}
            onChange={(e) => setFormData({ ...formData, english_name: handleEnglishInput(e) })}
            className="text-right"
            required
            dir="ltr"
          />
        </div>
      )}

      {formData.education_level !== undefined && (
        <div>
          <label className="text-sm font-medium block mb-1.5 text-right">المرحلة الدراسية</label>
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
          <label className="text-sm font-medium block mb-1.5 text-right">تاريخ الميلاد</label>
          <Input
            type="date"
            value={formData.birth_date || ""}
            onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
            className="text-right"
            required
          />
        </div>
      )}

      {formData.event_path !== undefined && (
        <div>
          <label className="text-sm font-medium block mb-1.5 text-right">المسار</label>
          <Select
            value={formData.event_path}
            onValueChange={(value: EventPathType) => setFormData({ ...formData, event_path: value })}
          >
            <SelectTrigger className="text-right">
              <SelectValue placeholder="اختر المسار" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="environment">البيئة</SelectItem>
              <SelectItem value="community">المجتمع</SelectItem>
              <SelectItem value="content">المحتوى</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <label className="text-sm font-medium block mb-1.5 text-right">البريد الإلكتروني</label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: handleEmailInput(e) })}
          className="text-right"
          required
          dir="ltr"
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1.5 text-right">رقم الجوال</label>
        <Input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: handleNumberInput(e) })}
          className="text-right"
          required
          maxLength={10}
          minLength={10}
          dir="ltr"
        />
      </div>
    </div>
  );
};