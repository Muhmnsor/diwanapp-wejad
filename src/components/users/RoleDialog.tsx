
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Role } from "./types";
import { useAuthStore } from "@/store/refactored-auth";

interface RoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onSave: () => void;
}

export const RoleDialog = ({ isOpen, onClose, role, onSave }: RoleDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [role, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("الرجاء إدخال اسم الدور");
      return;
    }

    if (!user) {
      toast.error("يجب تسجيل الدخول لإضافة أو تعديل الأدوار");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Saving role with name:", name);
      
      if (role) {
        // تحديث دور موجود
        const { error } = await supabase
          .from('roles')
          .update({ name, description })
          .eq('id', role.id);

        if (error) {
          console.error("Error updating role:", error);
          throw error;
        }
      } else {
        // إضافة دور جديد
        const { error } = await supabase
          .from('roles')
          .insert([{ name, description }]);

        if (error) {
          console.error("Error inserting role:", error);
          throw error;
        }
      }

      // تسجيل نشاط المستخدم
      try {
        await supabase.rpc('log_user_activity', {
          user_id: user.id,
          activity_type: role ? 'role_update' : 'role_create',
          details: role ? `تم تحديث الدور: ${name}` : `تم إنشاء دور جديد: ${name}`
        });
      } catch (activityError) {
        console.error("Error logging activity:", activityError);
        // Non-critical, continue even if activity logging fails
      }

      toast.success(role ? "تم تحديث الدور بنجاح" : "تم إضافة الدور بنجاح");
      onSave();
    } catch (error: any) {
      console.error("Error saving role:", error);
      
      // Display more helpful error messages
      if (error.code === "42501") {
        toast.error("ليست لديك صلاحية لإضافة أو تعديل الأدوار");
      } else if (error.code === "23505") {
        toast.error("يوجد دور بهذا الاسم بالفعل");
      } else {
        toast.error(`حدث خطأ أثناء حفظ الدور: ${error.message || error}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{role ? "تعديل دور" : "إضافة دور جديد"}</DialogTitle>
          <DialogDescription>
            {role ? "قم بتعديل معلومات الدور أدناه" : "أدخل معلومات الدور الجديد أدناه"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم الدور</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: مدير النظام"
                required
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">وصف الدور</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف مختصر للدور والصلاحيات المرتبطة به"
                rows={3}
                className="text-right"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-start flex-row-reverse">
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? "جار الحفظ..." : "حفظ"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              إلغاء
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
