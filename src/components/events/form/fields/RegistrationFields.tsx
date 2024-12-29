import { Input } from "@/components/ui/input";
import { Event } from "@/store/eventStore";

interface RegistrationFieldsProps {
  formData: Event;
  setFormData: (data: Event) => void;
}

export const RegistrationFields = ({ formData, setFormData }: RegistrationFieldsProps) => {
  return (
    <>
      <div>
        <label className="text-sm font-medium block mb-1.5">السعر (اتركه فارغاً للفعاليات المجانية)</label>
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
        <label className="text-sm font-medium block mb-1.5">عدد المقاعد</label>
        <Input
          type="number"
          value={formData.max_attendees}
          onChange={(e) => setFormData({ ...formData, max_attendees: Number(e.target.value) })}
          className="text-right"
        />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5">تاريخ بدء التسجيل</label>
        <Input
          type="date"
          value={formData.registrationStartDate || ''}
          onChange={(e) => setFormData({ ...formData, registrationStartDate: e.target.value })}
          className="text-right"
        />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5">تاريخ انتهاء التسجيل</label>
        <Input
          type="date"
          value={formData.registrationEndDate || ''}
          onChange={(e) => setFormData({ ...formData, registrationEndDate: e.target.value })}
          className="text-right"
        />
      </div>
    </>
  );
};