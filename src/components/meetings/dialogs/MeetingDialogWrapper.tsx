
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AttendanceType } from "@/types/meeting";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DynamicListInput } from "../form/DynamicListInput";
import { useCreateMeeting } from "@/hooks/meetings/useCreateMeeting";

interface MeetingDialogWrapperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  folderId?: string;
}

// Define the form schema
const formSchema = z.object({
  title: z.string().min(3, { message: "العنوان يجب أن يكون أكثر من 3 أحرف" }),
  date: z.string().min(1, { message: "يجب تحديد التاريخ" }),
  start_time: z.string().min(1, { message: "يجب تحديد وقت البدء" }),
  duration: z.number().min(1, { message: "يجب تحديد المدة بالدقائق" }),
  location: z.string().optional(),
  meeting_link: z.string().optional(),
  attendance_type: z.string().min(1, { message: "يجب تحديد نوع الحضور" }),
  meeting_status: z.string().min(1, { message: "يجب تحديد حالة الاجتماع" }),
});

interface ListItem {
  id: string;
  content: string;
  order_number: number;
}

export const MeetingDialogWrapper = ({ open, onOpenChange, onSuccess, folderId }: MeetingDialogWrapperProps) => {
  const [agendaItems, setAgendaItems] = useState<ListItem[]>([]);
  const [objectives, setObjectives] = useState<ListItem[]>([]);
  const { createMeeting, isLoading } = useCreateMeeting();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      date: new Date().toISOString().split('T')[0],
      start_time: "09:00",
      duration: 60,
      location: "",
      meeting_link: "",
      attendance_type: "in_person",
      meeting_status: "scheduled",
    },
  });
  
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!folderId) {
      toast.error("يجب تحديد تصنيف الاجتماع");
      return;
    }
    
    // Validate agenda items and objectives
    const validAgendaItems = agendaItems.filter(item => item.content.trim() !== "");
    const validObjectives = objectives.filter(item => item.content.trim() !== "");
    
    const result = await createMeeting({
      ...values,
      folder_id: folderId,
      agenda_items: validAgendaItems,
      objectives: validObjectives,
    });
    
    if (result) {
      onOpenChange(false);
      if (onSuccess) onSuccess();
      
      // Reset form
      form.reset();
      setAgendaItems([]);
      setObjectives([]);
    }
  };
  
  const handleClose = () => {
    form.reset();
    setAgendaItems([]);
    setObjectives([]);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إنشاء اجتماع جديد</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان الاجتماع</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="أدخل عنوان الاجتماع" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ الاجتماع</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وقت البدء</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>مدة الاجتماع (بالدقائق)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value))} 
                      min={1} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="attendance_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الحضور</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الحضور" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="in_person">حضوري</SelectItem>
                      <SelectItem value="virtual">افتراضي</SelectItem>
                      <SelectItem value="hybrid">مختلط</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المكان</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="أدخل مكان الاجتماع" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="meeting_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رابط الاجتماع الافتراضي (اختياري)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="أدخل رابط الاجتماع" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="meeting_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>حالة الاجتماع</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر حالة الاجتماع" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="scheduled">مجدول</SelectItem>
                      <SelectItem value="in_progress">جاري</SelectItem>
                      <SelectItem value="completed">مكتمل</SelectItem>
                      <SelectItem value="cancelled">ملغي</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <Label>جدول الأعمال</Label>
              <DynamicListInput 
                items={agendaItems}
                onChange={setAgendaItems}
                placeholder="أدخل بند جدول الأعمال"
                addLabel="إضافة بند جديد"
              />
            </div>
            
            <div className="space-y-2">
              <Label>أهداف الاجتماع</Label>
              <DynamicListInput 
                items={objectives}
                onChange={setObjectives}
                placeholder="أدخل هدف الاجتماع"
                addLabel="إضافة هدف جديد"
              />
            </div>
            
            <DialogFooter dir="ltr" className="!mt-8">
              <Button type="button" variant="outline" onClick={handleClose}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'جاري الإنشاء...' : 'إنشاء الاجتماع'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
