
import { Event } from "@/types/event";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EventTypeFieldsProps {
  formData: Event;
  setFormData: (data: Event) => void;
}

export const EventTypeFields = ({ formData, setFormData }: EventTypeFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="text-sm font-medium block mb-1.5">نوع الفعالية</label>
        <Select
          value={formData.event_type}
          onValueChange={(value: 'online' | 'in-person') => 
            setFormData({ ...formData, event_type: value })
          }
        >
          <SelectTrigger className="text-right">
            <SelectValue placeholder="اختر نوع الفعالية" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="in-person">حضوري</SelectItem>
            <SelectItem value="online">عن بعد</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1.5">نوع المستفيدين</label>
        <Select
          value={formData.beneficiary_type}
          onValueChange={(value: 'men' | 'women' | 'both') => 
            setFormData({ ...formData, beneficiary_type: value })
          }
        >
          <SelectTrigger className="text-right">
            <SelectValue placeholder="اختر نوع المستفيدين" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="men">رجال</SelectItem>
            <SelectItem value="women">نساء</SelectItem>
            <SelectItem value="both">رجال ونساء</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
