
import { Event } from "@/store/eventStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1.5">وصف الفعالية</label>
        <Textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="text-right min-h-[100px]"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1.5">تاريخ البداية</label>
        <Input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="text-right"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1.5">تاريخ النهاية (اختياري)</label>
        <Input
          type="date"
          value={formData.end_date || ''}
          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
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
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1.5">المكان</label>
        <Input
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="text-right"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1.5">رابط الموقع (اختياري)</label>
        <Input
          value={formData.location_url || ''}
          onChange={(e) => setFormData({ ...formData, location_url: e.target.value })}
          className="text-right"
          dir="ltr"
          type="url"
          placeholder="https://"
        />
      </div>
    </>
  );
};
