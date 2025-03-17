
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MeetingType, AttendanceType } from "@/types/meeting";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(3, { message: "العنوان مطلوب ويجب أن يكون على الأقل 3 أحرف" }),
  meeting_type: z.enum(["board", "department", "team", "committee", "other"] as const),
  date: z.string().min(1, { message: "التاريخ مطلوب" }),
  start_time: z.string().min(1, { message: "وقت البدء مطلوب" }),
  duration: z.number().min(1, { message: "المدة مطلوبة" }),
  attendance_type: z.enum(["in_person", "virtual", "hybrid"] as const),
  location: z.string().optional(),
  meeting_link: z.string().url({ message: "يرجى إدخال رابط صحيح" }).optional().or(z.literal("")),
  objectives: z.string().optional(),
});

interface CreateMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CreateMeetingDialog = ({ open, onOpenChange, onSuccess }: CreateMeetingDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      meeting_type: "department",
      date: new Date().toISOString().split("T")[0],
      start_time: "14:00",
      duration: 60,
      attendance_type: "in_person",
      location: "",
      meeting_link: "",
      objectives: "",
    },
  });
  
  const attendanceType = form.watch("attendance_type");
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // API call to create meeting will be implemented later
      console.log("Creating meeting:", values);
      
      // Mock success for now
      setTimeout(() => {
        setIsSubmitting(false);
        onOpenChange(false);
        if (onSuccess) onSuccess();
      }, 1000);
    } catch (error) {
      console.error("Error creating meeting:", error);
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>إنشاء اجتماع جديد</DialogTitle>
          <DialogDescription>
            أدخل تفاصيل الاجتماع الجديد
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان الاجتماع</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل عنوان الاجتماع" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="meeting_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع الاجتماع</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع الاجتماع" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="board">مجلس إدارة</SelectItem>
                        <SelectItem value="department">قسم</SelectItem>
                        <SelectItem value="team">فريق</SelectItem>
                        <SelectItem value="committee">لجنة</SelectItem>
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>التاريخ</FormLabel>
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
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المدة (دقيقة)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {(attendanceType === "in_person" || attendanceType === "hybrid") && (
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المكان</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل مكان الاجتماع" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {(attendanceType === "virtual" || attendanceType === "hybrid") && (
              <FormField
                control={form.control}
                name="meeting_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رابط الاجتماع</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل رابط الاجتماع" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="objectives"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>أهداف الاجتماع</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="أدخل أهداف الاجتماع" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري الإنشاء...
                  </>
                ) : (
                  "إنشاء الاجتماع"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
