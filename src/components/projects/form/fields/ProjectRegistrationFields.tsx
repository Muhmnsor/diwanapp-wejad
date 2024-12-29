import { Input } from "@/components/ui/input";

interface ProjectRegistrationFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const ProjectRegistrationFields = ({ formData, setFormData }: ProjectRegistrationFieldsProps) => {
  return (
    <div className="space-y-4 text-right">
      <div>
        <label className="block text-sm font-medium mb-1.5">السعر (اتركه فارغاً للمشاريع المجانية)</label>
        <Input
          type="number"
          value={formData.price === null ? "" : formData.price}
          onChange={(e) => {
            const value = e.target.value;
            setFormData({
              ...formData,
              price: value === "" ? null : Number(value)
            });
          }}
          placeholder="أدخل السعر"
          className="text-right"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">عدد المقاعد</label>
        <Input
          type="number"
          value={formData.max_attendees}
          onChange={(e) => setFormData({ ...formData, max_attendees: Number(e.target.value) })}
          className="text-right"
        />
      </div>
    </div>
  );
};