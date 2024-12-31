import { Project } from "@/types/project";
import { ImageUpload } from "@/components/ui/image-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ProjectBasicFieldsProps {
  formData: Project;
  setFormData: (data: Project) => void;
  onImageChange?: (file: File | null) => void;
}

export const ProjectBasicFields = ({ formData, setFormData, onImageChange }: ProjectBasicFieldsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-1.5">عنوان المشروع</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="text-right"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium block mb-1.5">وصف المشروع</label>
        <Textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="text-right"
        />
      </div>

      {onImageChange && (
        <div>
          <label className="text-sm font-medium block mb-1.5">صورة المشروع</label>
          <ImageUpload
            onChange={onImageChange}
            value={formData.image_url}
          />
        </div>
      )}
    </div>
  );
};