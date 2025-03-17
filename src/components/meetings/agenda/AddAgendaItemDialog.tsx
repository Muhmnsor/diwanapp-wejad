
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
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(2, { message: "يجب أن يتكون العنوان من حرفين على الأقل" }),
  description: z.string().optional(),
  order_number: z.coerce.number().int().positive({ message: "يجب أن يكون الترتيب رقماً موجباً" }),
});

type FormValues = z.infer<typeof formSchema>;

interface AddAgendaItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingId: string;
}

export const AddAgendaItemDialog = ({ 
  open, 
  onOpenChange,
  meetingId 
}: AddAgendaItemDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      order_number: 1,
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
        .from('meeting_agenda_items')
        .insert([
          {
            meeting_id: meetingId,
            title: data.title,
            description: data.description || null,
            order_number: data.order_number,
          }
        ]);
      
      if (error) throw error;
      
      toast.success("تمت إضافة البند بنجاح");
      queryClient.invalidateQueries({ queryKey: ['meeting-agenda', meetingId] });
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(`فشل إضافة البند: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إضافة بند جديد</DialogTitle>
          <DialogDescription>
            أضف بنداً جديداً إلى جدول أعمال الاجتماع
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العنوان</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل عنوان البند" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوصف (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="أدخل وصفاً للبند" 
                      {...field} 
                      className="resize-none"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="order_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الترتيب</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1}
                      {...field}
                    />
                  </FormControl>
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
                  "إضافة البند"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
