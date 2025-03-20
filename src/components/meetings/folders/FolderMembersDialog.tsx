
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, UserPlus } from "lucide-react";
import { AddMemberDialog } from "./AddMemberDialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useUserRoles } from "@/hooks/useUserRoles";

interface Folder {
  id: string;
  name: string;
  created_by: string;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  profile: {
    display_name: string;
    email: string;
  };
}

interface FolderMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder: Folder;
  onSuccess?: () => void;
}

export const FolderMembersDialog = ({
  open,
  onOpenChange,
  folder,
  onSuccess,
}: FolderMembersDialogProps) => {
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const { hasAdminRole } = useUserRoles();
  const isCreator = supabase.auth.getUser().then(({ data }) => data.user?.id === folder.created_by);

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from("meeting_folder_members")
      .select(`
        id,
        user_id,
        role,
        profile:user_id(display_name, email)
      `)
      .eq("folder_id", folder.id);

    if (error) throw error;
    return data;
  };

  const { data: members, isLoading, error, refetch } = useQuery({
    queryKey: ["folderMembers", folder.id],
    queryFn: fetchMembers,
  });

  const { mutate: removeMember, isPending: isRemoving } = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("meeting_folder_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast.success("تم إزالة العضو بنجاح");
      refetch();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error(`حدث خطأ أثناء إزالة العضو: ${error.message}`);
    },
  });

  const handleMemberAdded = () => {
    refetch();
    if (onSuccess) onSuccess();
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>أعضاء التصنيف: {folder.name}</DialogTitle>
            <DialogDescription>إدارة الأعضاء المصرح لهم بالوصول إلى هذا التصنيف</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center h-60">
            <Loader2 className="h-8 w-8 animate-spin text-primary ml-2" />
            <span>جاري تحميل الأعضاء...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>أعضاء التصنيف: {folder.name}</DialogTitle>
          <DialogDescription>إدارة الأعضاء المصرح لهم بالوصول إلى هذا التصنيف</DialogDescription>
        </DialogHeader>

        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              حدث خطأ أثناء تحميل الأعضاء: {(error as Error).message}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button 
                onClick={() => setIsAddMemberOpen(true)}
                disabled={!(hasAdminRole || isCreator)}
              >
                <UserPlus className="h-4 w-4 ml-2" />
                إضافة عضو
              </Button>
            </div>

            {!members || members.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">
                لا يوجد أعضاء مضافين لهذا التصنيف
              </p>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>البريد الإلكتروني</TableHead>
                      <TableHead>الدور</TableHead>
                      <TableHead className="text-left">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member: Member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {member.profile?.display_name || "مستخدم"}
                        </TableCell>
                        <TableCell>{member.profile?.email || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={member.role === "editor" ? "default" : "outline"}>
                            {member.role === "editor" ? "محرر" : "مشاهد"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMember(member.id)}
                            disabled={isRemoving || !(hasAdminRole || isCreator)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        <AddMemberDialog
          open={isAddMemberOpen}
          onOpenChange={setIsAddMemberOpen}
          folderId={folder.id}
          onSuccess={handleMemberAdded}
        />
      </DialogContent>
    </Dialog>
  );
};
