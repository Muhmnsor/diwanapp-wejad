import { Project } from "@/types/project";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventPathType, EventCategoryType } from "@/types/event";

interface ProjectPathFieldsProps {
  formData: Project;
  setFormData: (data: Project) => void;
}

export const ProjectPathFields = ({ formData, setFormData }: ProjectPathFieldsProps) => {
  const getCategoryOptions = (path: EventPathType): EventCategoryType[] => {
    switch (path) {
      case 'environment':
        return ['social', 'entertainment', 'service', 'educational', 'consulting'];
      case 'community':
        return ['interest', 'specialization'];
      case 'content':
        return ['spiritual', 'cultural', 'behavioral', 'skill', 'health', 'diverse'];
      default:
        return ['social'];
    }
  };

  return (
    <>
      <div>
        <label className="text-sm font-medium block mb-1.5">المسار</label>
        <Select
          value={formData.event_path || 'environment'}
          onValueChange={(value: EventPathType) => {
            setFormData({
              ...formData,
              event_path: value,
              event_category: getCategoryOptions(value)[0]
            });
          }}
        >
          <SelectTrigger className="text-right">
            <SelectValue placeholder="اختر المسار" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="environment">البيئة</SelectItem>
            <SelectItem value="community">المجتمع</SelectItem>
            <SelectItem value="content">المحتوى</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1.5">الفئة</label>
        <Select
          value={formData.event_category || 'social'}
          onValueChange={(value: EventCategoryType) => 
            setFormData({ ...formData, event_category: value })
          }
        >
          <SelectTrigger className="text-right">
            <SelectValue placeholder="اختر الفئة" />
          </SelectTrigger>
          <SelectContent>
            {getCategoryOptions(formData.event_path as EventPathType).map((category) => (
              <SelectItem key={category} value={category}>
                {category === 'social' && 'اجتماعي'}
                {category === 'entertainment' && 'ترفيهي'}
                {category === 'service' && 'خدمي'}
                {category === 'educational' && 'تعليمي'}
                {category === 'consulting' && 'استشاري'}
                {category === 'interest' && 'اهتمام'}
                {category === 'specialization' && 'تخصص'}
                {category === 'spiritual' && 'روحي'}
                {category === 'cultural' && 'ثقافي'}
                {category === 'behavioral' && 'سلوكي'}
                {category === 'skill' && 'مهاري'}
                {category === 'health' && 'صحي'}
                {category === 'diverse' && 'متنوع'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};