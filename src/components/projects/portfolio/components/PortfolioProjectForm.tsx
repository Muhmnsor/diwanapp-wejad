import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PortfolioProjectFormData } from "../types/portfolio";

interface PortfolioProjectFormProps {
  formData: PortfolioProjectFormData;
  setFormData: (data: PortfolioProjectFormData) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const PortfolioProjectForm = ({
  formData,
  setFormData,
  isSubmitting,
  onSubmit,
  onCancel
}: PortfolioProjectFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-4">
      <div>
        <label className="text-sm font-medium block mb-1">
          اسم المشروع <span className="text-red-500">*</span>
        </label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="أدخل اسم المشروع"
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">الوصف</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="أدخل وصف المشروع"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1">تاريخ البدء</label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">تاريخ الانتهاء</label>
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">الحالة</label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر حالة المشروع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="not_started">لم يبدأ</SelectItem>
            <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
            <SelectItem value="completed">مكتمل</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">الخصوصية</label>
        <Select
          value={formData.privacy}
          onValueChange={(value) => setFormData({ ...formData, privacy: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر مستوى الخصوصية" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="private">خاص</SelectItem>
            <SelectItem value="public">عام</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          إلغاء
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "جاري الإنشاء..." : "إنشاء المشروع"}
        </Button>
      </div>
    </form>
  );
};