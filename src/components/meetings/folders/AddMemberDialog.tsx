
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId: string;
  onSuccess?: () => void;
}

const formSchema = z.object({
  user_id: z.string().uuid("يرجى اختيار مستخدم صالح"),
  role: z.enum(["viewer", "editor"]),
});

type FormValues = z.infer<typeof formSchema>;

interface User {
  id: string;
  display_name: string;
  email: string;
}

export const AddMemberDialog = ({
  open,
  onOpenChange,
  folderId,
  onSuccess,
}: AddMemberDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "viewer",
    },
  });

  const fetchUsers = async () => {
    if (!searchQuery || searchQuery.length < 2) return [];
    
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, email")
      .or(`display_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
      .limit(10);

    if (error) throw error;
    return data;
  };

  const { data: users, isLoading: isSearching, refetch } = useQuery({
    queryKey: ["searchUsers", searchQuery],
    queryFn: fetchUsers,
    enabled: searchQuery.length >= 2,
  });

  const { mutate: addMember, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      // Check if member already exists
      const { data: existingMember, error: checkError } = await supabase
        .from("meeting_folder_members")
        .select("id")
        .eq("folder_id", folderId)
        .eq("user_id", values.user_id)
        .single();

      if (checkError && checkError.code !== "PGRST116") throw checkError;
      
      if (existingMember) {
        throw new Error("هذا المستخدم عضو بالفعل في هذا التصنيف");
      }

      const { data, error } = await supabase
        .from("meeting_folder_members")
        .insert({
          folder_id: folderId,
          user_id: values.user_id,
          role: values.role,
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("تمت إضافة العضو بنجاح");
      form.reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error(`حدث خطأ أثناء إضافة العضو: ${error.message}`);
    },
  });

  const onSubmit = (values: FormValues) => {
    addMember(values);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length >= 2) {
      refetch();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إضافة عضو جديد</DialogTitle>
          <DialogDescription>
            أضف عضوًا جديدًا للوصول إلى تصنيف الاجتماعات
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <Input
                placeholder="ابحث عن مستخدم بالاسم أو البريد الإلكتروني"
                value={searchQuery}
                onChange={handleSearchChange}
                className="pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <Search className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>

            {searchQuery.length >= 2 && (
              <div className="border rounded-md max-h-40 overflow-y-auto">
                {isSearching ? (
                  <div className="flex justify-center items-center h-20">
                    <Loader2 className="h-4 w-4 animate-spin text-primary ml-2" />
                    <span className="text-sm">جار البحث...</span>
                  </div>
                ) : users && users.length > 0 ? (
                  <div className="p-1">
                    {users.map((user: User) => (
                      <div
                        key={user.id}
                        className="p-2 hover:bg-muted rounded-sm cursor-pointer"
                        onClick={() => form.setValue("user_id", user.id)}
                      >
                        <div className="font-medium">{user.display_name || "مستخدم"}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-20">
                    <span className="text-sm text-muted-foreground">لا توجد نتائج</span>
                  </div>
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المستخدم المحدد</FormLabel>
                  <FormControl>
                    <Input readOnly {...field} placeholder="لم يتم تحديد مستخدم" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الدور</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الدور" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="viewer">مشاهد</SelectItem>
                      <SelectItem value="editor">محرر</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "جاري الإضافة..." : "إضافة العضو"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
