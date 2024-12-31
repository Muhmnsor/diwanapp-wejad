import { Input } from "@/components/ui/input";

interface ProjectPersonalInfoFieldsProps {
  formData: {
    email: string;
    phone: string;
    arabicName: string;
    englishName: string;
  };
  setFormData: (data: any) => void;
  showEnglishName?: boolean;
}

export const ProjectPersonalInfoFields = ({
  formData,
  setFormData,
  showEnglishName = false
}: ProjectPersonalInfoFieldsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">الاسم بالعربية</label>
        <Input
          type="text"
          value={formData.arabicName}
          onChange={(e) => setFormData(prev => ({ ...prev, arabicName: e.target.value }))}
          className="w-full"
          required
        />
      </div>

      {showEnglishName && (
        <div>
          <label className="block text-sm font-medium mb-1">الاسم بالإنجليزية</label>
          <Input
            type="text"
            value={formData.englishName}
            onChange={(e) => setFormData(prev => ({ ...prev, englishName: e.target.value }))}
            className="w-full"
            required
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">رقم الجوال</label>
        <Input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          className="w-full"
          required
        />
      </div>
    </div>
  );
};