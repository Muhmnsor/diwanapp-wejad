import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RegistrationFormData } from "../../hooks/useRegistrationState";

interface IdentityFieldsProps {
  formData: RegistrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegistrationFormData>>;
  registrationFields: {
    birth_date: boolean;
    national_id: boolean;
    gender: boolean;
  };
}

export const IdentityFields = ({
  formData,
  setFormData,
  registrationFields,
}: IdentityFieldsProps) => {
  return (
    <>
      {registrationFields.birth_date && (
        <div>
          <Label htmlFor="birthDate">تاريخ الميلاد</Label>
          <Input
            id="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, birthDate: e.target.value }))
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
              setFormData((prev) => ({ ...prev, nationalId: e.target.value }))
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
              setFormData((prev) => ({ ...prev, gender: value }))
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
    </>
  );
};