
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface OrganizationalUnit {
  id: string;
  name: string;
  description?: string;
  unit_type: string;
  parent_id?: string;
  is_active?: boolean;
}

interface OrganizationalUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editMode: boolean;
  unit?: OrganizationalUnit | null;
  units: OrganizationalUnit[];
  onSuccess: () => void;
}

const UNIT_TYPES = [
  { value: "department", label: "إدارة" },
  { value: "division", label: "قسم" },
  { value: "section", label: "شعبة" },
  { value: "team", label: "فريق" },
  { value: "unit", label: "وحدة" }
];

export function OrganizationalUnitDialog({ 
  open, 
  onOpenChange, 
  editMode, 
  unit,
  units,
  onSuccess
}: OrganizationalUnitDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unitType, setUnitType] = useState("department");
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Initialize form values when editing
  useEffect(() => {
    if (editMode && unit) {
      setName(unit.name || "");
      setDescription(unit.description || "");
      setUnitType(unit.unit_type || "department");
      setParentId(unit.parent_id || undefined);
    } else {
      // Reset form for new unit
      setName("");
      setDescription("");
      setUnitType("department");
      setParentId(undefined);
    }
  }, [editMode, unit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editMode && unit) {
        // Update existing unit
        const { error } = await supabase
          .from('organizational_units')
          .update({
            name,
            description,
            unit_type: unitType,
            parent_id: parentId || null,
            updated_at: new Date()
          })
          .eq('id', unit.id);

        if (error) throw error;
        
        toast({
          title: "تم التحديث بنجاح",
          description: "تم تحديث الوحدة التنظيمية بنجاح"
        });
      } else {
        // Create new unit
        const { error } = await supabase
          .from('organizational_units')
          .insert({
            name,
            description,
            unit_type: unitType,
            parent_id: parentId || null,
            created_by: (await supabase.auth.getUser()).data.user?.id
          });

        if (error) throw error;
        
        toast({
          title: "تمت الإضافة بنجاح",
          description: "تم إضافة الوحدة التنظيمية بنجاح"
        });
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving organizational unit:", error);
      toast({
        title: "حدث خطأ",
        description: "حدث خطأ أثناء حفظ الوحدة التنظيمية",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter out the current unit from parent options to prevent circular references
  const parentOptions = editMode && unit 
    ? units.filter(u => u.id !== unit.id) 
    : units;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editMode ? "تعديل وحدة تنظيمية" : "إضافة وحدة تنظيمية جديدة"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">اسم الوحدة التنظيمية</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أدخل اسم الوحدة التنظيمية"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="unit-type">نوع الوحدة</Label>
            <Select value={unitType} onValueChange={setUnitType} required>
              <SelectTrigger id="unit-type">
                <SelectValue placeholder="اختر نوع الوحدة" />
              </SelectTrigger>
              <SelectContent>
                {UNIT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="parent-id">الوحدة الأب</Label>
            <Select 
              value={parentId} 
              onValueChange={setParentId}
            >
              <SelectTrigger id="parent-id">
                <SelectValue placeholder="بدون وحدة أب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">بدون وحدة أب</SelectItem>
                {parentOptions.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} ({UNIT_TYPES.find(t => t.value === u.unit_type)?.label})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="أدخل وصف الوحدة التنظيمية (اختياري)"
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "جاري الحفظ..." : editMode ? "تحديث" : "إضافة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
