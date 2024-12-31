import { Input } from "@/components/ui/input";
import { Event } from "@/store/eventStore";

interface EventLocationFieldsProps {
  formData: Event;
  setFormData: (data: Event) => void;
}

export const EventLocationFields = ({ formData, setFormData }: EventLocationFieldsProps) => {
  return (
    <div>
      <label className="text-sm font-medium block mb-1.5">الموقع</label>
      <Input
        value={formData.location}
        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        className="text-right"
        placeholder="أدخل موقع الفعالية"
        required
      />
    </div>
  );
};