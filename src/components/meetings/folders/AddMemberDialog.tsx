
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface User {
  id: string;
  display_name: string;
  email: string;
}

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId: string;
  onSuccess?: () => void;
}

export const AddMemberDialog = ({
  open,
  onOpenChange,
  folderId,
  onSuccess,
}: AddMemberDialogProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [role, setRole] = useState<"viewer" | "editor">("viewer");

  // Fetch users for dropdown
  const { data: users, isLoading } = useQuery({
    queryKey: ["profiles", searchTerm],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, email")
        .ilike("display_name", `%${searchTerm}%`)
        .order("display_name", { ascending: true })
        .limit(10);

      if (error) throw error;
      return data as User[];
    },
    enabled: open,
  });

  // Add member mutation
  const { mutate: addMember, isPending } = useMutation({
    mutationFn: async () => {
      if (!selectedUser) {
        throw new Error("يرجى اختيار مستخدم");
      }

      const { data, error } = await supabase.from("meeting_folder_members").insert({
        folder_id: folderId,
        user_id: selectedUser,
        role: role,
      }).select();

      if (error) {
        if (error.code === "23505") {
          throw new Error("هذا المستخدم عضو بالفعل في هذا التصنيف");
        }
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      toast.success("تمت إضافة العضو بنجاح");
      resetForm();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء إضافة العضو");
    },
  });

  const resetForm = () => {
    setSearchTerm("");
    setSelectedUser(null);
    setRole("viewer");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMember();
  };

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) resetForm();
      onOpenChange(value);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إضافة عضو جديد</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user">المستخدم</Label>
            <Input
              id="user-search"
              placeholder="ابحث عن مستخدم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-2"
            />
            
            {isLoading ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <Select value={selectedUser || ""} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر مستخدم..." />
                </SelectTrigger>
                <SelectContent>
                  {users && users.length > 0 ? (
                    users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.display_name} ({user.email})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-results" disabled>
                      لا توجد نتائج للبحث
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">الدور</Label>
            <Select value={role} onValueChange={(value) => setRole(value as "viewer" | "editor")}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الدور..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">مشاهد</SelectItem>
                <SelectItem value="editor">محرر</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={!selectedUser || isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الإضافة...
                </>
              ) : (
                "إضافة"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
