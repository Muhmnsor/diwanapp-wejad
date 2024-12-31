import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Event } from "@/store/eventStore";

interface EventTitleDescriptionFieldsProps {
  formData: Event;
  setFormData: (data: Event) => void;
}

export const EventTitleDescriptionFields = ({ formData, setFormData }: EventTitleDescriptionFieldsProps) => {
  return (
    <>
      <div>
        <label className="text-sm font-medium block mb-1.5">عنوان الفعالية</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="text-right"
          placeholder="أدخل عنوان الفعالية"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5">وصف الفعالية</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="text-right"
          placeholder="أدخل وصف الفعالية"
          required
        />
      </div>
    </>
  );
};