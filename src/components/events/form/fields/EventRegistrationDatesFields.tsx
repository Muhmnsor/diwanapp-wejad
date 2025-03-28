import { Input } from "@/components/ui/input";
import { Event } from "@/store/eventStore";

interface EventRegistrationDatesFieldsProps {
  formData: Event;
  setFormData: (data: Event) => void;
}

export const EventRegistrationDatesFields = ({ formData, setFormData }: EventRegistrationDatesFieldsProps) => {
  return (
    <>
      <div>
        <label className="text-sm font-medium block mb-1.5">تاريخ بدء التسجيل</label>
        <Input
          type="date"
          value={formData.registrationStartDate || formData.registration_start_date || ''}
          onChange={(e) => setFormData({ 
            ...formData, 
            registrationStartDate: e.target.value,
            registration_start_date: e.target.value 
          })}
          className="text-right"
        />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5">تاريخ نهاية التسجيل</label>
        <Input
          type="date"
          value={formData.registrationEndDate || formData.registration_end_date || ''}
          onChange={(e) => setFormData({ 
            ...formData, 
            registrationEndDate: e.target.value,
            registration_end_date: e.target.value 
          })}
          className="text-right"
        />
      </div>
    </>
  );
};