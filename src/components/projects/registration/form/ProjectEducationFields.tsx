import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Calendar, Book, User } from "lucide-react";
import { useState } from "react";

interface ProjectEducationFieldsProps {
  formData: {
    educationLevel: string;
    birthDate: string;
    nationalId: string;
  };
  setFormData: (data: any) => void;
}

export const ProjectEducationFields = ({
  formData,
  setFormData
}: ProjectEducationFieldsProps) => {
  const [errors, setErrors] = useState({
    educationLevel: "",
    birthDate: "",
    nationalId: "",
  });

  const validateNationalId = (value: string) => {
    if (!/^1\d{9}$/.test(value)) {
      setErrors(prev => ({ 
        ...prev, 
        nationalId: "يجب أن يبدأ رقم الهوية بـ 1 ويتكون من 10 أرقام" 
      }));
      return false;
    }
    setErrors(prev => ({ ...prev, nationalId: "" }));
    return true;
  };

  const validateBirthDate = (value: string) => {
    const date = new Date(value);
    const now = new Date();
    const minDate = new Date();
    minDate.setFullYear(now.getFullYear() - 80);
    const maxDate = new Date();
    maxDate.setFullYear(now.getFullYear() - 15);

    if (date > maxDate || date < minDate) {
      setErrors(prev => ({ 
        ...prev, 
        birthDate: "العمر يجب أن يكون بين 15 و 80 سنة" 
      }));
      return false;
    }
    setErrors(prev => ({ ...prev, birthDate: "" }));
    return true;
  };

  return (
    <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
      <div>
        <Label className="text-right block mb-2">المستوى التعليمي</Label>
        <Select
          value={formData.educationLevel}
          onValueChange={(value) => {
            setFormData(prev => ({ ...prev, educationLevel: value }));
            setErrors(prev => ({ ...prev, educationLevel: "" }));
          }}
        >
          <SelectTrigger className="w-full text-right">
            <Book className="h-4 w-4 ml-2" />
            <SelectValue placeholder="اختر المستوى التعليمي" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high_school">ثانوي</SelectItem>
            <SelectItem value="bachelor">بكالوريوس</SelectItem>
            <SelectItem value="master">ماجستير</SelectItem>
            <SelectItem value="phd">دكتوراه</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-right block mb-2">تاريخ الميلاد</Label>
        <div className="relative">
          <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-500" />
          <Input
            type="date"
            value={formData.birthDate}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, birthDate: e.target.value }));
              validateBirthDate(e.target.value);
            }}
            className={`text-right pr-10 ${errors.birthDate ? 'border-red-500' : ''}`}
            required
          />
        </div>
        {errors.birthDate && (
          <p className="text-sm text-red-500 mt-1 text-right flex items-center justify-end gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.birthDate}
          </p>
        )}
      </div>

      <div>
        <Label className="text-right block mb-2">رقم الهوية</Label>
        <div className="relative">
          <User className="absolute right-3 top-3 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            value={formData.nationalId}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 10);
              setFormData(prev => ({ ...prev, nationalId: value }));
              validateNationalId(value);
            }}
            className={`text-right pr-10 ${errors.nationalId ? 'border-red-500' : ''}`}
            placeholder="1XXXXXXXXX"
            required
            dir="ltr"
          />
        </div>
        {errors.nationalId && (
          <p className="text-sm text-red-500 mt-1 text-right flex items-center justify-end gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.nationalId}
          </p>
        )}
      </div>
    </div>
  );
};