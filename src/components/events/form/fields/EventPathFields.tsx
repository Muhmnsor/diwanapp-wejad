import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Event } from "@/store/eventStore";
import { EventPathType, EventCategoryType } from "@/types/event";
import { useEffect } from "react";

interface EventPathFieldsProps {
  formData: Event;
  setFormData: (data: Event) => void;
}

export const EventPathFields = ({ formData, setFormData }: EventPathFieldsProps) => {
  const getCategoryOptions = (path: EventPathType): { value: EventCategoryType; label: string }[] => {
    switch (path) {
      case 'environment':
        return [
          { value: 'social', label: 'اجتماعية' },
          { value: 'entertainment', label: 'ترفيهية' },
          { value: 'service', label: 'خدمية' },
          { value: 'educational', label: 'تعليمية' },
          { value: 'consulting', label: 'استشارية' },
        ];
      case 'community':
        return [
          { value: 'interest', label: 'اهتمام' },
          { value: 'specialization', label: 'تخصص' },
        ];
      case 'content':
        return [
          { value: 'spiritual', label: 'روحي' },
          { value: 'cultural', label: 'ثقافي' },
          { value: 'behavioral', label: 'سلوكي' },
          { value: 'skill', label: 'مهاري' },
          { value: 'health', label: 'صحي' },
          { value: 'diverse', label: 'متنوع' },
        ];
      default:
        return [];
    }
  };

  // Reset category when path changes
  useEffect(() => {
    const options = getCategoryOptions(formData.event_path as EventPathType);
    if (!options.some(opt => opt.value === formData.event_category)) {
      setFormData({
        ...formData,
        event_category: options[0]?.value as EventCategoryType
      });
    }
  }, [formData.event_path]);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-1.5">مسار الفعالية</label>
        <Select
          value={formData.event_path}
          onValueChange={(value: EventPathType) => 
            setFormData({ ...formData, event_path: value })
          }
        >
          <SelectTrigger className="text-right">
            <SelectValue placeholder="اختر مسار الفعالية" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="environment">بيئة</SelectItem>
            <SelectItem value="community">مجتمع</SelectItem>
            <SelectItem value="content">محتوى</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1.5">تصنيف الفعالية</label>
        <Select
          value={formData.event_category}
          onValueChange={(value: EventCategoryType) => 
            setFormData({ ...formData, event_category: value })
          }
        >
          <SelectTrigger className="text-right">
            <SelectValue placeholder="اختر تصنيف الفعالية" />
          </SelectTrigger>
          <SelectContent>
            {getCategoryOptions(formData.event_path as EventPathType).map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};