import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Event } from "@/store/eventStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EventFormFieldsProps {
  formData: Event;
  setFormData: (data: Event) => void;
}

export const EventFormFields = ({ formData, setFormData }: EventFormFieldsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">عنوان الفعالية</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>
      <div>
        <label className="text-sm font-medium">وصف الفعالية</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div>
        <label className="text-sm font-medium">التاريخ</label>
        <Input
          type="date"
          value={formData.date}
          onChange={(e) => {
            console.log('Selected date:', e.target.value);
            setFormData({ ...formData, date: e.target.value });
          }}
        />
      </div>
      <div>
        <label className="text-sm font-medium">الوقت</label>
        <Input
          type="time"
          value={formData.time}
          onChange={(e) => {
            console.log('Selected time:', e.target.value);
            setFormData({ ...formData, time: e.target.value });
          }}
        />
      </div>
      <div>
        <label className="text-sm font-medium">الموقع</label>
        <Input
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />
      </div>
      <div>
        <label className="text-sm font-medium">نوع الفعالية</label>
        <Select
          value={formData.eventType}
          onValueChange={(value: "online" | "in-person") => 
            setFormData({ ...formData, eventType: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="in-person">حضوري</SelectItem>
            <SelectItem value="online">عن بعد</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium">عدد المقاعد</label>
        <Input
          type="number"
          value={formData.maxAttendees}
          onChange={(e) => setFormData({ ...formData, maxAttendees: Number(e.target.value) })}
        />
      </div>
    </div>
  );
};