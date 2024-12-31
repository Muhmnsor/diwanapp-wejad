import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Event } from "@/store/eventStore";

interface BasicEventFieldsProps {
  formData: Event;
  setFormData: (data: Event) => void;
}

export const BasicEventFields = ({ formData, setFormData }: BasicEventFieldsProps) => {
  return (
    <>
      <div>
        <label className="text-sm font-medium block mb-1.5">عنوان الفعالية</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="text-right"
        />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5">وصف الفعالية</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="text-right"
        />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5">التاريخ</label>
        <Input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="text-right"
        />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5">الوقت</label>
        <Input
          type="time"
          value={formData.time}
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          className="text-right"
        />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5">الموقع</label>
        <Input
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="text-right"
        />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5">رابط الموقع (اختياري)</label>
        <Input
          type="url"
          placeholder="https://maps.google.com/..."
          value={formData.location_url || ""}
          onChange={(e) => setFormData({ ...formData, location_url: e.target.value })}
          className="text-right"
          dir="ltr"
        />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5">السعر</label>
        <Input
          type="number"
          min="0"
          placeholder="اترك الحقل فارغاً للفعاليات المجانية"
          value={formData.price === "free" ? "" : formData.price || ""}
          onChange={(e) => {
            const value = e.target.value;
            setFormData({ 
              ...formData, 
              price: value === "" ? "free" : Number(value)
            });
          }}
          className="text-right"
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