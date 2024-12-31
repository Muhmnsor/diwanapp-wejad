import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Event } from "@/store/eventStore";

interface EventPriceAndSeatsFieldsProps {
  formData: Event;
  setFormData: (data: Event) => void;
}

export const EventPriceAndSeatsFields = ({ formData, setFormData }: EventPriceAndSeatsFieldsProps) => {
  return (
    <>
      <div>
        <label className="text-sm font-medium block mb-1.5">السعر</label>
        <Input
          type="number"
          min="0"
          value={formData.price || ''}
          onChange={(e) => {
            const value = e.target.value;
            setFormData({ 
              ...formData, 
              price: value === '' ? null : Number(value)
            });
          }}
          className="text-right"
          placeholder="اترك الحقل فارغاً للفعاليات المجانية"
        />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5">عدد المقاعد</label>
        <Input
          type="number"
          min="0"
          value={formData.max_attendees}
          onChange={(e) => setFormData({ ...formData, max_attendees: parseInt(e.target.value) || 0 })}
          className="text-right"
          placeholder="أدخل عدد المقاعد المتاحة"
          required
        />
      </div>
    </>
  );
};