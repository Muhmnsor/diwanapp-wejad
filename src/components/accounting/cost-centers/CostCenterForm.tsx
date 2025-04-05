
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCostCenterOperations } from "@/hooks/accounting/useCostCenterOperations";
import { CostCenter } from "@/hooks/accounting/useCostCenters";

interface CostCenterFormProps {
  costCenter?: CostCenter;
  onCancel: () => void;
  onSuccess: () => void;
}

export const CostCenterForm = ({ costCenter, onCancel, onSuccess }: CostCenterFormProps) => {
  const { toast } = useToast();
  const { createCostCenter, updateCostCenter, isLoading } = useCostCenterOperations();

  const [formData, setFormData] = useState({
    code: costCenter?.code || "",
    name: costCenter?.name || "",
    description: costCenter?.description || "",
    is_active: costCenter?.is_active !== undefined ? costCenter.is_active : true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.name) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    try {
      if (costCenter?.id) {
        await updateCostCenter(costCenter.id, formData);
        toast({
          title: "تم تحديث مركز التكلفة",
          description: "تم تحديث بيانات مركز التكلفة بنجاح",
        });
      } else {
        await createCostCenter(formData);
        toast({
          title: "تم إنشاء مركز التكلفة",
          description: "تم إضافة مركز التكلفة الجديد بنجاح",
        });
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving cost center:", error);
      toast({
        title: "خطأ في العملية",
        description: "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">رمز مركز التكلفة</Label>
          <Input
            id="code"
            name="code"
            placeholder="مثال: CC001"
            value={formData.code}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">اسم مركز التكلفة</Label>
          <Input
            id="name"
            name="name"
            placeholder="اسم مركز التكلفة"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="وصف مركز التكلفة (اختياري)"
          value={formData.description || ""}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          إلغاء
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "جاري الحفظ..." : costCenter ? "تحديث مركز التكلفة" : "إضافة مركز التكلفة"}
        </Button>
      </div>
    </form>
  );
};
