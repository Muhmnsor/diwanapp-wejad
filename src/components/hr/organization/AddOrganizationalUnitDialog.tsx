
import * as React from "react";
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganizationalUnits } from "@/hooks/hr/useOrganizationalUnits";
import { useQueryClient } from "@tanstack/react-query";

type OrganizationalUnitType = "department" | "division" | "section" | "team" | "position";

interface AddOrganizationalUnitDialogProps {
  onUnitAdded?: () => void;
}

export function AddOrganizationalUnitDialog({ onUnitAdded }: AddOrganizationalUnitDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: units = [] } = useOrganizationalUnits();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unit_type: "department" as OrganizationalUnitType,
    parent_id: ""
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("organizational_units")
        .insert([{
          name: formData.name,
          description: formData.description,
          unit_type: formData.unit_type,
          parent_id: formData.parent_id || null
        }])
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "تمت الإضافة بنجاح",
        description: "تم إضافة الوحدة التنظيمية بنجاح"
      });

      // تحديث البيانات
      queryClient.invalidateQueries({ queryKey: ['organizational-units'] });
      queryClient.invalidateQueries({ queryKey: ['organizational-hierarchy'] });
      
      // إغلاق الحوار وإعادة تعيين النموذج
      setOpen(false);
      setFormData({
        name: "",
        description: "",
        unit_type: "department",
        parent_id: ""
      });
      
      // استدعاء التابع إذا تم توفيره
      if (onUnitAdded) {
        onUnitAdded();
      }
    } catch (error) {
      console.error("Error adding organizational unit:", error);
      toast({
        title: "حدث خطأ",
        description: "لم يتم إضافة الوحدة التنظيمية",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const unitTypes: { value: OrganizationalUnitType; label: string }[] = [
    { value: "department", label: "إدارة" },
    { value: "division", label: "قسم" },
    { value: "section", label: "شعبة" },
    { value: "team", label: "فريق" },
    { value: "position", label: "منصب" }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-1">
          <Plus className="h-4 w-4" />
          إضافة وحدة تنظيمية
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>إضافة وحدة تنظيمية جديدة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">الاسم</Label>
              <Input
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="unit_type">النوع</Label>
              <Select
                value={formData.unit_type}
                onValueChange={(value) => handleSelectChange("unit_type", value)}
              >
                <SelectTrigger id="unit_type">
                  <SelectValue placeholder="اختر نوع الوحدة" />
                </SelectTrigger>
                <SelectContent>
                  {unitTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="parent_id">الوحدة الأم</Label>
              <Select
                value={formData.parent_id}
                onValueChange={(value) => handleSelectChange("parent_id", value)}
              >
                <SelectTrigger id="parent_id">
                  <SelectValue placeholder="اختر الوحدة الأم (اختياري)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">بدون وحدة أم</SelectItem>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "جاري الإضافة..." : "إضافة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
