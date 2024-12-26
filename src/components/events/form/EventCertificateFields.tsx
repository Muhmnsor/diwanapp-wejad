import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Event } from "@/store/eventStore";

interface EventCertificateFieldsProps {
  formData: Event;
  setFormData: (data: Event) => void;
}

export const EventCertificateFields = ({ formData, setFormData }: EventCertificateFieldsProps) => {
  const handleHoursChange = (value: string) => {
    const numValue = value ? Number(value) : undefined;
    if (!isNaN(Number(value)) || value === '') {
      setFormData({ ...formData, eventHours: numValue });
    }
  };

  const handleCertificateTypeChange = (value: string) => {
    setFormData({ 
      ...formData, 
      certificateType: value,
      eventHours: undefined 
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-1.5">نوع الشهادة</label>
        <Select
          value={formData.certificateType || 'none'}
          onValueChange={handleCertificateTypeChange}
        >
          <SelectTrigger className="text-right">
            <SelectValue placeholder="اختر نوع الشهادة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">بدون شهادة</SelectItem>
            <SelectItem value="attendance">شهادة حضور</SelectItem>
            <SelectItem value="certified">شهادة معتمدة</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {formData.certificateType && formData.certificateType !== 'none' && (
        <div>
          <label className="text-sm font-medium block mb-1.5">عدد ساعات الفعالية</label>
          <Input
            type="number"
            value={formData.eventHours ?? ''}
            onChange={(e) => handleHoursChange(e.target.value)}
            min={0}
            step={0.5}
            className="text-right"
            placeholder="أدخل عدد الساعات"
          />
        </div>
      )}
    </div>
  );
};