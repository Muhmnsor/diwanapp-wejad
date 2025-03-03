
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WorkspaceMember } from "@/types/workspace";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface MembersListProps {
  members: WorkspaceMember[] | undefined;
  isLoading: boolean;
  workspaceId: string;
}

export const MembersList = ({ members, isLoading, workspaceId }: MembersListProps) => {
  const queryClient = useQueryClient();
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  const handleRemoveMember = async (memberId: string) => {
    setIsRemoving(memberId);
    
    try {
      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('id', memberId);
      
      if (error) throw error;
      
      // تحديث عدد الأعضاء في الجدول workspaces
      await supabase.rpc('update_workspace_members_count', { 
        workspace_id: workspaceId
      });
      
      // Actualizar la interfaz
      queryClient.invalidateQueries({ queryKey: ['workspace-members', workspaceId] });
      
      toast.success("تمت إزالة العضو بنجاح");
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("حدث خطأ أثناء إزالة العضو");
    } finally {
      setIsRemoving(null);
    }
  };

  if (isLoading) {
    return <p className="text-gray-500 text-center py-4">جاري التحميل...</p>;
  }

  if (!members || members.length === 0) {
    return <p className="text-gray-500 text-center py-4">لا يوجد أعضاء حاليًا</p>;
  }

  return (
    <div className="space-y-2">
      {members.map((member) => (
        <div 
          key={member.id} 
          className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
        >
          <div>
            <p className="font-medium">{member.user_display_name || member.user_email}</p>
            <p className="text-sm text-gray-500">{member.user_email}</p>
            <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded mt-1">
              {member.role === 'admin' ? 'مدير' : member.role === 'member' ? 'عضو' : 'مشاهد'}
            </span>
          </div>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => handleRemoveMember(member.id)}
            disabled={isRemoving === member.id}
          >
            {isRemoving === member.id ? "جاري الإزالة..." : "إزالة"}
          </Button>
        </div>
      ))}
    </div>
  );
};
