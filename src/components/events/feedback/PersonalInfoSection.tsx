import { User, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PersonalInfoSectionProps {
  name: string;
  phone: string;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
}

export const PersonalInfoSection = ({
  name,
  phone,
  onNameChange,
  onPhoneChange,
}: PersonalInfoSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <User className="w-4 h-4" />
          الاسم (اختياري)
        </label>
        <Input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="أدخل اسمك"
          className="bg-white"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <Phone className="w-4 h-4" />
          رقم الجوال (اختياري)
        </label>
        <Input
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="أدخل رقم جوالك"
          className="bg-white"
          type="tel"
        />
      </div>
    </div>
  );
};