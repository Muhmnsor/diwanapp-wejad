
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useMeetings } from '../hooks/useMeetings';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MeetingParticipantsField } from '../form/MeetingParticipantsField';
import { MeetingAgendaItemsField } from '../form/MeetingAgendaItemsField';

const meetingFormSchema = z.object({
  title: z.string().min(3, { message: 'العنوان يجب أن يكون 3 أحرف على الأقل' }),
  meeting_type: z.enum(['board', 'general_assembly', 'committee', 'other']),
  date: z.string().min(1, { message: 'الرجاء اختيار تاريخ' }),
  start_time: z.string().min(1, { message: 'الرجاء اختيار وقت البدء' }),
  duration: z.coerce.number().min(1, { message: 'المدة يجب أن تكون أكثر من 0' }),
  attendance_type: z.enum(['in_person', 'remote', 'hybrid']),
  location: z.string().optional(),
  meeting_link: z.string().optional(),
  objectives: z.string().optional(),
  participants: z.array(
    z.object({
      user_id: z.string(),
      role: z.enum(['chairman', 'member', 'secretary', 'observer'])
    })
  ).min(1, { message: 'يجب إضافة مشارك واحد على الأقل' }),
  agenda_items: z.array(
    z.object({
      title: z.string().min(1, { message: 'العنوان مطلوب' }),
      description: z.string().optional(),
      order_number: z.number()
    })
  ).optional()
});

type MeetingFormValues = z.infer<typeof meetingFormSchema>;

interface NewMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewMeetingDialog = ({ open, onOpenChange }: NewMeetingDialogProps) => {
  const { createMeeting, isCreating } = useMeetings();
  
  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: {
      title: '',
      meeting_type: 'board',
      date: '',
      start_time: '',
      duration: 60,
      attendance_type: 'in_person',
      location: '',
      meeting_link: '',
      objectives: '',
      participants: [],
      agenda_items: []
    }
  });

  const onSubmit = (data: MeetingFormValues) => {
    // Format agenda items to ensure they have order numbers
    const formattedAgendaItems = data.agenda_items?.map((item, index) => ({
      ...item,
      order_number: item.order_number || index + 1
    })) || [];

    // Call the createMeeting function
    createMeeting({
      ...data,
      agenda_items: formattedAgendaItems
    }, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      }
    });
  };

  // Show or hide location/link field based on attendance type
  const attendanceType = form.watch('attendance_type');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>إنشاء اجتماع جديد</DialogTitle>
          <DialogDescription>
            قم بإدخال معلومات الاجتماع والمشاركين وجدول الأعمال
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="details">
              <TabsList className="mb-4">
                <TabsTrigger value="details">تفاصيل الاجتماع</TabsTrigger>
                <TabsTrigger value="participants">المشاركون</TabsTrigger>
                <TabsTrigger value="agenda">جدول الأعمال</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
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
                            <SelectItem value="general_assembly">جمعية عمومية</SelectItem>
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
                            <SelectItem value="remote">عن بعد</SelectItem>
                            <SelectItem value="hybrid">هجين</SelectItem>
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
                        <FormLabel>المدة (دقائق)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {attendanceType === 'in_person' || attendanceType === 'hybrid' ? (
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
                ) : null}

                {attendanceType === 'remote' || attendanceType === 'hybrid' ? (
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
                ) : null}

                <FormField
                  control={form.control}
                  name="objectives"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>أهداف الاجتماع</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="أدخل أهداف الاجتماع" 
                          className="h-24" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="participants">
                <MeetingParticipantsField form={form} />
              </TabsContent>

              <TabsContent value="agenda">
                <MeetingAgendaItemsField form={form} />
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => onOpenChange(false)}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'جاري الإنشاء...' : 'إنشاء الاجتماع'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
