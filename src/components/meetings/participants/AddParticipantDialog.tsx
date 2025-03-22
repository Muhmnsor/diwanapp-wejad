
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAddMeetingParticipant } from "@/hooks/meetings/useAddMeetingParticipant";
import { useUsers } from "@/hooks/meetings/useUsers";
import { ParticipantRole, AttendanceStatus } from "@/types/meeting";

interface AddParticipantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingId: string;
  onSuccess?: () => void;
}

const formSchema = z.object({
  user_id: z.string().optional(),
  user_display_name: z.string().min(2, "الاسم مطلوب ويجب أن يحتوي على حرفين على الأقل"),
  user_email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
  user_phone: z.string().optional().or(z.literal("")),
  role: z.enum(["chairman", "secretary", "member", "viewer"] as const),
  attendance_status: z.enum(["pending", "attended", "excused", "absent"] as const),
  is_external: z.boolean().default(false)
});

type FormValues = z.infer<typeof formSchema>;

export const AddParticipantDialog = ({ 
  open, 
  onOpenChange, 
  meetingId,
  onSuccess 
}: AddParticipantDialogProps) => {
  const [isExternal, setIsExternal] = useState(false);
  const { mutate: addParticipant, isPending } = useAddMeetingParticipant();
  const { data: users, isLoading: usersLoading } = useUsers();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_display_name: "",
      user_email: "",
      user_phone: "",
      role: "member",
      attendance_status: "pending",
      is_external: false
    }
  });
  
  const handleSubmit = (values: FormValues) => {
    console.log("Submitting participant:", values);
    
    addParticipant({
      meetingId,
      participant: {
        ...values,
        is_external: isExternal
      }
    }, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
        if (onSuccess) onSuccess();
      }
    });
  };
  
  const handleUserSelect = (userId: string) => {
    const selectedUser = users?.find(user => user.id === userId);
    if (selectedUser) {
      form.setValue("user_id", selectedUser.id);
      form.setValue("user_display_name", selectedUser.display_name);
      form.setValue("user_email", selectedUser.email);
      form.setValue("user_phone", selectedUser.phone || "");
    }
  };
  
  const toggleExternalUser = (external: boolean) => {
    setIsExternal(external);
    form.setValue("is_external", external);
    
    if (external) {
      form.setValue("user_id", undefined);
    } else {
      form.setValue("user_display_name", "");
      form.setValue("user_email", "");
      form.setValue("user_phone", "");
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>إضافة مشارك جديد</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <FormLabel>مشارك خارجي</FormLabel>
              <Switch
                checked={isExternal}
                onCheckedChange={toggleExternalUser}
              />
              <span className="text-sm text-muted-foreground">
                {isExternal ? "مشارك خارجي غير مسجل بالنظام" : "مشارك من مستخدمي النظام"}
              </span>
            </div>
            
            {!isExternal ? (
              <FormField
                control={form.control}
                name="user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اختر المستخدم</FormLabel>
                    <Select 
                      onValueChange={(value) => handleUserSelect(value)}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المستخدم" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {usersLoading ? (
                          <SelectItem value="loading">جاري التحميل...</SelectItem>
                        ) : (
                          users?.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.display_name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="user_display_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم المشارك</FormLabel>
                      <FormControl>
                        <Input placeholder="ادخل اسم المشارك" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="user_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>البريد الإلكتروني</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="ادخل البريد الإلكتروني" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="user_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم الهاتف</FormLabel>
                      <FormControl>
                        <Input placeholder="ادخل رقم الهاتف" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>دور المشارك</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر دور المشارك" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="chairman">رئيس</SelectItem>
                      <SelectItem value="secretary">سكرتير</SelectItem>
                      <SelectItem value="member">عضو</SelectItem>
                      <SelectItem value="viewer">مشاهد</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="attendance_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>حالة الحضور</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر حالة الحضور" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">معلق</SelectItem>
                      <SelectItem value="attended">حضر</SelectItem>
                      <SelectItem value="excused">معتذر</SelectItem>
                      <SelectItem value="absent">غائب</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "جاري الإضافة..." : "إضافة المشارك"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
