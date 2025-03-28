
import { Input } from "@/components/ui/input";
import { Event } from "@/store/eventStore";

interface EventDateTimeFieldsProps {
  formData: Event;
  setFormData: (data: Event) => void;
}

export const EventDateTimeFields = ({ formData, setFormData }: EventDateTimeFieldsProps) => {
  return (
    <>
      <div>
        <label className="text-sm font-medium block mb-1.5">التاريخ</label>
        <Input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="text-right"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5">الوقت</label>
        <Input
          type="time"
          value={formData.time}
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          className="text-right"
          required
        />
      </div>
    </>
  );
};
