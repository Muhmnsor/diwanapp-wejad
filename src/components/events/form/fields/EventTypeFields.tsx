import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Event } from "@/store/eventStore";
import { BeneficiaryType } from "@/types/event";

interface EventTypeFieldsProps {
  formData: Event;
  setFormData: (data: Event) => void;
}

export const EventTypeFields = ({ formData, setFormData }: EventTypeFieldsProps) => {
  return (
    <>
      <div>
        <label className="text-sm font-medium block mb-1.5">نوع الفعالية</label>
        <Select
          value={formData.eventType}
          onValueChange={(value: "online" | "in-person") => 
            setFormData({ ...formData, eventType: value })
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
          value={formData.beneficiaryType}
          onValueChange={(value: BeneficiaryType) => 
            setFormData({ ...formData, beneficiaryType: value })
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
    </>
  );
};