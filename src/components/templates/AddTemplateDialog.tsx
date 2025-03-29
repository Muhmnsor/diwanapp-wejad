
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUp } from "lucide-react";

interface AddTemplateDialogProps {
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  newTemplate: {
    name: string;
    department: string;
    template_number: string;
    description: string;
    category: string;
  };
  setNewTemplate: React.Dispatch<
    React.SetStateAction<{
      name: string;
      department: string;
      template_number: string;
      description: string;
      category: string;
    }>
  >;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: string[];
  categories: string[];
}

export const AddTemplateDialog = ({
  isLoading,
  handleSubmit,
  handleFileChange,
  newTemplate,
  setNewTemplate,
  open,
  onOpenChange,
  departments,
  categories,
}: AddTemplateDialogProps) => {
  const updateTemplate = (field: string, value: string) => {
    setNewTemplate((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl">إضافة نموذج جديد</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم النموذج*</Label>
              <Input
                id="name"
                value={newTemplate.name}
                onChange={(e) => updateTemplate("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template_number">رقم النموذج*</Label>
              <Input
                id="template_number"
                value={newTemplate.template_number}
                onChange={(e) => updateTemplate("template_number", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">الإدارة/الوحدة*</Label>
              {departments.length > 0 ? (
                <Select
                  value={newTemplate.department}
                  onValueChange={(value) => updateTemplate("department", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الإدارة" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                    <SelectItem value="أخرى">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="department"
                  value={newTemplate.department}
                  onChange={(e) => updateTemplate("department", e.target.value)}
                  required
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">التصنيف</Label>
              {categories.length > 0 ? (
                <Select
                  value={newTemplate.category}
                  onValueChange={(value) => updateTemplate("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر التصنيف" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                    <SelectItem value="أخرى">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="category"
                  value={newTemplate.category}
                  onChange={(e) => updateTemplate("category", e.target.value)}
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">وصف النموذج</Label>
            <Textarea
              id="description"
              value={newTemplate.description}
              onChange={(e) => updateTemplate("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">ملف النموذج* (الحد الأقصى: 10 ميجابايت)</Label>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("file-upload")?.click()}
                className="w-full"
              >
                <FileUp className="h-4 w-4 ml-2" />
                اختر ملف النموذج
              </Button>
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                required
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  جاري الحفظ...
                </>
              ) : (
                "حفظ النموذج"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
