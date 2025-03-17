
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  user_email: z.string().email({ message: "يرجى إدخال بريد إلكتروني صحيح" }),
  user_display_name: z.string().min(2, { message: "يجب أن يتكون الاسم من حرفين على الأقل" }),
  role: z.enum(["organizer", "presenter", "member", "guest"], { 
    required_error: "يرجى اختيار دور المشارك" 
  }),
  attendance_status: z.enum(["pending", "confirmed", "attended", "absent"], { 
    required_error: "يرجى اختيار حالة الحضور" 
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface AddParticipantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingId: string;
}

export const AddParticipantDialog = ({ 
  open, 
  onOpenChange,
  meetingId 
}: AddParticipantDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_email: "",
      user_display_name: "",
      role: "member",
      attendance_status: "pending",
    },
  });
  
  const onSubmit = async (data: FormValues) => {
    if (!meetingId) {
      toast.error("معرف الاجتماع غير محدد");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('meeting_participants')
        .insert([
          {
            meeting_id: meetingId,
            user_email: data.user_email,
            user_display_name: data.user_display_name,
            role: data.role,
            attendance_status: data.attendance_status,
          }
        ]);
      
      if (error) throw error;
      
      toast.success("تمت إضافة المشارك بنجاح");
      queryClient.invalidateQueries({ queryKey: ['meeting-participants', meetingId] });
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(`فشل إضافة المشارك: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إضافة مشارك جديد</DialogTitle>
          <DialogDescription>
            أدخل معلومات المشارك في الاجتماع
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="user_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل البريد الإلكتروني" {...field} dir="ltr" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="user_display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل اسم المشارك" {...field} />
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
                        <SelectValue placeholder="اختر دور المشارك" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="organizer">منظم</SelectItem>
                      <SelectItem value="presenter">مقدم</SelectItem>
                      <SelectItem value="member">عضو</SelectItem>
                      <SelectItem value="guest">ضيف</SelectItem>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر حالة الحضور" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">قيد الإنتظار</SelectItem>
                      <SelectItem value="confirmed">مؤكد</SelectItem>
                      <SelectItem value="attended">حضر</SelectItem>
                      <SelectItem value="absent">متغيب</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جارِ الإضافة...
                  </>
                ) : (
                  "إضافة المشارك"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
