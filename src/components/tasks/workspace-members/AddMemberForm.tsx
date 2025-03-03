
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { WorkspaceMember } from "@/types/workspace";

interface AddMemberFormProps {
  workspaceId: string;
  members?: WorkspaceMember[];
  users?: { id: string; email: string; display_name: string }[];
  isUsersLoading: boolean;
}

export const AddMemberForm = ({ workspaceId, members, users, isUsersLoading }: AddMemberFormProps) => {
  const [email, setEmail] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [role, setRole] = useState<"admin" | "member" | "viewer">("member");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    const selectedUser = users?.find(user => user.id === userId);
    if (selectedUser) {
      setEmail(selectedUser.email || "");
    }
  };

  const handleAddMember = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId && !email.trim()) {
      toast.error("يرجى اختيار مستخدم أو إدخال البريد الإلكتروني");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const userEmail = email.trim();
      
      // Verificar si el correo electrónico ya existe como miembro
      if (members?.some(member => 
        (selectedUserId && member.user_id === selectedUserId) || 
        (userEmail && member.user_email?.toLowerCase() === userEmail.toLowerCase())
      )) {
        toast.error("هذا المستخدم موجود بالفعل في مساحة العمل");
        setIsSubmitting(false);
        return;
      }

      // الحصول على معلومات المستخدم المحدد إن وجد
      let userId = selectedUserId;
      let userDisplayName = "";
      
      if (selectedUserId) {
        const selectedUser = users?.find(user => user.id === selectedUserId);
        if (selectedUser) {
          userDisplayName = selectedUser.display_name || selectedUser.email?.split('@')[0] || "";
        }
      } else {
        // في حالة إدخال بريد إلكتروني يدوياً
        userDisplayName = userEmail.split('@')[0];
      }

      // Obtener información del usuario actual para guardarla como creador del espacio
      const { data: { user } } = await supabase.auth.getUser();
      
      // Agregar miembro al espacio de trabajo
      const { error } = await supabase
        .from('workspace_members')
        .insert([
          {
            workspace_id: workspaceId,
            user_id: userId || user?.id || '00000000-0000-0000-0000-000000000000', // ID temporal si no hay usuario
            role,
            user_email: userEmail || null,
            user_display_name: userDisplayName // Nombre provisional basado en el email
          }
        ]);
      
      if (error) throw error;
      
      // تحديث عدد الأعضاء في الجدول workspaces
      await supabase.rpc('update_workspace_members_count', { 
        workspace_id: workspaceId
      });

      // Actualizar la interfaz
      queryClient.invalidateQueries({ queryKey: ['workspace-members', workspaceId] });
      
      toast.success("تمت إضافة العضو بنجاح");
      setEmail("");
      setSelectedUserId("");
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("حدث خطأ أثناء إضافة العضو");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleAddMember} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="userSelect">اختر مستخدم</Label>
        <Select value={selectedUserId} onValueChange={handleUserSelect}>
          <SelectTrigger>
            <SelectValue placeholder="اختر مستخدم من القائمة" />
          </SelectTrigger>
          <SelectContent>
            {isUsersLoading ? (
              <SelectItem value="loading" disabled>جاري التحميل...</SelectItem>
            ) : users && users.length > 0 ? (
              users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.display_name || user.email || 'مستخدم بدون اسم'}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-users" disabled>لا يوجد مستخدمين</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">أو أدخل البريد الإلكتروني يدوياً</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="أدخل البريد الإلكتروني للعضو"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="role">الدور</Label>
        <Select value={role} onValueChange={(value: "admin" | "member" | "viewer") => setRole(value)}>
          <SelectTrigger>
            <SelectValue placeholder="اختر دور العضو" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">مدير</SelectItem>
            <SelectItem value="member">عضو</SelectItem>
            <SelectItem value="viewer">مشاهد</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "جاري الإضافة..." : "إضافة عضو"}
      </Button>
    </form>
  );
};
