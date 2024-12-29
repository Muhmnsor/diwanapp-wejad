import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BeneficiaryType } from "@/types/event";

interface ProjectTypeFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const ProjectTypeFields = ({ formData, setFormData }: ProjectTypeFieldsProps) => {
  return (
    <>
      <div>
        <label className="block text-sm font-medium mb-1.5">نوع المشروع</label>
        <Select
          value={formData.event_type}
          onValueChange={(value: "online" | "in-person") => 
            setFormData({ ...formData, event_type: value })
          }
        >
          <SelectTrigger className="text-right">
            <SelectValue placeholder="اختر نوع المشروع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="in-person">حضوري</SelectItem>
            <SelectItem value="online">عن بعد</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">نوع المستفيدين</label>
        <Select
          value={formData.beneficiary_type}
          onValueChange={(value: BeneficiaryType) => 
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
    </>
  );
};