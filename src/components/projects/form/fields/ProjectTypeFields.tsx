import { Project } from "@/types/project";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { BeneficiaryType } from "@/types/event";

interface ProjectTypeFieldsProps {
  formData: Project;
  setFormData: (data: Project) => void;
}

export const ProjectTypeFields = ({ formData, setFormData }: ProjectTypeFieldsProps) => {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">المستفيدين والتصنيف</h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1.5">نوع المشروع</label>
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
          <label className="text-sm font-medium block mb-1.5">نوع المستفيدين</label>
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

        <div>
          <label className="text-sm font-medium block mb-1.5">السعر (اتركه فارغاً للمشاريع المجانية)</label>
          <Input
            type="number"
            value={formData.price || ''}
            onChange={(e) => setFormData({ ...formData, price: e.target.value ? Number(e.target.value) : null })}
            className="text-right"
          />
        </div>
      </div>
    </Card>
  );
};