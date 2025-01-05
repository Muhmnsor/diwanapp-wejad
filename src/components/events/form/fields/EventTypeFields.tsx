import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Event } from "@/store/eventStore";
import { BeneficiaryType } from "@/types/event";

interface EventTypeFieldsProps {
  formData: Event;
  setFormData: (data: Event) => void;
}

export const EventTypeFields = ({ formData, setFormData }: EventTypeFieldsProps) => {
  console.log('EventTypeFields formData:', formData);
  
  return (
    <>
      <div>
        <label className="text-sm font-medium block mb-1.5">نوع الفعالية</label>
        <Select
          value={formData.event_type}
          onValueChange={(value: "online" | "in-person") => 
            setFormData({ 
              ...formData, 
              event_type: value,
              eventType: value // Keep both fields in sync
            })}
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
          onValueChange={(value: BeneficiaryType) => 
            setFormData({ 
              ...formData, 
              beneficiary_type: value,
              beneficiaryType: value // Keep both fields in sync
            })}
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