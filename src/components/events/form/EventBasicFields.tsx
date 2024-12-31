import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Event } from "@/store/eventStore";

interface EventBasicFieldsProps {
  formData: Event;
  setFormData: (data: Event) => void;
}

export const EventBasicFields = ({ formData, setFormData }: EventBasicFieldsProps) => {
  return (
    <div className="space-y-4">
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
        <label className="text-sm font-medium block mb-1.5">السعر</label>
        <Select
          value={formData.price?.toString() || "free"}
          onValueChange={(value) => setFormData({ ...formData, price: value === "free" ? "free" : Number(value) })}
        >
          <SelectTrigger className="text-right">
            <SelectValue placeholder="اختر السعر" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free">مجاني</SelectItem>
            <SelectItem value="50">50 ريال</SelectItem>
            <SelectItem value="100">100 ريال</SelectItem>
            <SelectItem value="150">150 ريال</SelectItem>
            <SelectItem value="200">200 ريال</SelectItem>
          </SelectContent>
        </Select>
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
        />
      </div>
    </div>
  );
};