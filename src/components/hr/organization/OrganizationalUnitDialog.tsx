
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useOrganizationalUnits } from "@/hooks/hr/useOrganizationalUnits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface OrganizationalUnit {
  id?: string;
  name: string;
  description?: string;
  unit_type: string;
  parent_id?: string;
  is_active?: boolean;
  position_type?: 'standard' | 'side' | 'assistant';
}

interface OrganizationalUnitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  unitToEdit?: OrganizationalUnit | null;
  onUnitAdded?: () => void;
}

export function OrganizationalUnitDialog({
  isOpen,
  onClose,
  unitToEdit,
  onUnitAdded
}: OrganizationalUnitDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unitType, setUnitType] = useState("department");
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [positionType, setPositionType] = useState<'standard' | 'side' | 'assistant'>('standard');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: units, isLoading } = useOrganizationalUnits();

  useEffect(() => {
    if (unitToEdit) {
      setName(unitToEdit.name || "");
      setDescription(unitToEdit.description || "");
      setUnitType(unitToEdit.unit_type || "department");
      setParentId(unitToEdit.parent_id);
      setPositionType(unitToEdit.position_type || 'standard');
    } else {
      setName("");
      setDescription("");
      setUnitType("department");
      setParentId(undefined);
      setPositionType('standard');
    }
  }, [unitToEdit, isOpen]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم الوحدة التنظيمية",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const unitData: Partial<OrganizationalUnit> = {
        name,
        description,
        unit_type: unitType,
        parent_id: parentId === "none" ? null : parentId,
        position_type: positionType
      };

      let result;
      
      if (unitToEdit?.id) {
        result = await supabase
          .from('organizational_units')
          .update(unitData)
          .eq('id', unitToEdit.id);
      } else {
        result = await supabase
          .from('organizational_units')
          .insert([unitData]);
      }

      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: "تم بنجاح",
        description: unitToEdit?.id ? "تم تحديث الوحدة التنظيمية" : "تم إضافة الوحدة التنظيمية",
      });
      
      onUnitAdded?.();
      onClose();
    } catch (error) {
      console.error("Error saving organizational unit:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ الوحدة التنظيمية",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{unitToEdit?.id ? "تعديل الوحدة التنظيمية" : "إضافة وحدة تنظيمية جديدة"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              الاسم
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              الوصف
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              النوع
            </Label>
            <Select value={unitType} onValueChange={setUnitType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="اختر نوع الوحدة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="department">قسم</SelectItem>
                <SelectItem value="division">إدارة</SelectItem>
                <SelectItem value="team">فريق</SelectItem>
                <SelectItem value="unit">وحدة</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="parent" className="text-right">
              الوحدة الأم
            </Label>
            <Select 
              value={parentId || "none"} 
              onValueChange={setParentId}
              disabled={isLoading}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="اختر الوحدة الأم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">بدون</SelectItem>
                {units?.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="position" className="text-right">
              نوع الموضع
            </Label>
            <Select 
              value={positionType} 
              onValueChange={(value) => setPositionType(value as 'standard' | 'side' | 'assistant')}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="اختر نوع الموضع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">قياسي</SelectItem>
                <SelectItem value="side">جانبي</SelectItem>
                <SelectItem value="assistant">مساعد</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
