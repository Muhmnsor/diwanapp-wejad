
import React, { useState } from 'react';
import { Meeting } from '@/types/meeting';
import { MeetingMinutes, useSaveMeetingMinutes } from '@/hooks/meetings/useMeetingMinutes';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/refactored-auth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Download, Save } from 'lucide-react';
import { MeetingParticipantsContent } from '../participants/MeetingParticipantsContent';
import { Separator } from '@/components/ui/separator';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface EnhancedMeetingMinutesProps {
  meetingId: string;
  meeting: Meeting;
  minutes?: MeetingMinutes;
  isLoading?: boolean;
}

export const EnhancedMeetingMinutes: React.FC<EnhancedMeetingMinutesProps> = ({
  meetingId,
  meeting,
  minutes,
  isLoading = false,
}) => {
  const { user } = useAuthStore();
  const [introduction, setIntroduction] = useState(minutes?.introduction || '');
  const [conclusion, setConclusion] = useState(minutes?.conclusion || '');
  const [agendaNotes, setAgendaNotes] = useState<Record<string, string>>(minutes?.agenda_notes || {});
  const { mutateAsync: saveMinutes, isLoading: isSaving } = useSaveMeetingMinutes();

  // Create a function to handle changes to agenda notes
  const handleAgendaNoteChange = (agendaItemId: string, note: string) => {
    setAgendaNotes(prev => ({
      ...prev,
      [agendaItemId]: note
    }));
  };

  // Handle form submission
  const handleSave = async () => {
    try {
      await saveMinutes({
        meeting_id: meetingId,
        introduction,
        conclusion,
        agenda_notes: agendaNotes,
        author_id: user?.id,
        author_name: user?.display_name || user?.email
      });
      toast.success('تم حفظ محضر الاجتماع بنجاح');
    } catch (error) {
      console.error('Error saving meeting minutes:', error);
      toast.error('حدث خطأ أثناء حفظ المحضر');
    }
  };

  const handleExport = () => {
    // Placeholder for export functionality
    toast.info('سيتم تنفيذ تصدير المحضر قريباً');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <span className="mr-3 text-gray-600">جاري تحميل بيانات المحضر...</span>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500">لم يتم العثور على بيانات الاجتماع</p>
      </div>
    );
  }

  // Convert date string to a Date object
  const meetingDate = meeting.date ? new Date(meeting.date) : new Date();
  
  // Format for meeting date
  const formattedDate = format(meetingDate, 'yyyy-MM-dd');
  const currentTime = format(new Date(), 'HH:mm');
  const meetingTime = meeting.start_time || currentTime;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Meeting Details Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-primary">تفاصيل الاجتماع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold">عنوان الاجتماع:</span>
                <span>{meeting.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">التاريخ:</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">الوقت:</span>
                <span>{meetingTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">المدة:</span>
                <span>{meeting.duration} دقيقة</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold">النوع:</span>
                <span>{meeting.meeting_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">الحالة:</span>
                <span>{meeting.meeting_status}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">المكان:</span>
                <span>{meeting.location || 'غير محدد'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">نوع الحضور:</span>
                <span>{meeting.attendance_type}</span>
              </div>
            </div>
          </div>
          
          {meeting.objectives && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">أهداف الاجتماع:</h3>
              <p className="text-gray-700">{meeting.objectives}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Participants Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-primary">المشاركون</CardTitle>
        </CardHeader>
        <CardContent>
          <MeetingParticipantsContent meetingId={meetingId} view="compact" />
        </CardContent>
      </Card>

      {/* Meeting Content Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-primary">محتوى المحضر</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Introduction */}
          <div>
            <h3 className="text-lg font-medium mb-2">المقدمة</h3>
            <Textarea
              placeholder="اكتب مقدمة المحضر هنا..."
              className="min-h-[100px] resize-y"
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              dir="rtl"
            />
          </div>

          {/* Agenda Items */}
          <div>
            <h3 className="text-lg font-medium mb-4">بنود الاجتماع</h3>
            <div className="space-y-4">
              {meeting?.agenda_items?.length > 0 ? (
                meeting.agenda_items.map((item: any) => (
                  <div key={item.id} className="border rounded-md p-4">
                    <h4 className="font-medium mb-2">{item.title}</h4>
                    <Textarea
                      placeholder="اكتب ملاحظات حول هذا البند..."
                      className="min-h-[80px] resize-y"
                      value={agendaNotes[item.id] || ''}
                      onChange={(e) => handleAgendaNoteChange(item.id, e.target.value)}
                      dir="rtl"
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  لم يتم إضافة أي بنود لهذا الاجتماع
                </div>
              )}
            </div>
          </div>

          {/* Conclusion */}
          <div>
            <h3 className="text-lg font-medium mb-2">الخاتمة</h3>
            <Textarea
              placeholder="اكتب خاتمة المحضر هنا..."
              className="min-h-[100px] resize-y"
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
              dir="rtl"
            />
          </div>
        </CardContent>
      </Card>

      {/* Attachments Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-primary">المرفقات</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم المرفق</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Placeholder row - to be implemented with actual attachments */}
              <TableRow>
                <TableCell colSpan={3} className="text-center text-gray-500">
                  لا توجد مرفقات حالياً
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Signatures Section - Only show for completed meetings */}
      {meeting.meeting_status === 'completed' && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-primary">توقيعات الحضور</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الصفة</TableHead>
                  <TableHead>التوقيع</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Placeholder - to be implemented with actual participant signatures */}
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500">
                    لم يتم إضافة أي توقيعات بعد
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Author Information */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-primary">معلومات كاتب المحضر</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="font-semibold">الاسم:</span>
            <span>{minutes?.author_name || user?.display_name || user?.email || 'غير محدد'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">المسمى الوظيفي:</span>
            <span>{user?.position || 'غير محدد'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">تاريخ كتابة المحضر:</span>
            <span>{format(new Date(), 'yyyy-MM-dd')}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">وقت كتابة المحضر:</span>
            <span>{format(new Date(), 'HH:mm')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Actions Footer */}
      <div className="flex justify-end space-x-4 pt-4">
        <Button 
          variant="outline" 
          onClick={handleExport} 
          className="ml-4 flex items-center"
        >
          <Download className="ml-2 h-4 w-4" />
          تصدير المحضر
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="flex items-center"
        >
          {isSaving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white ml-2"></div>
          ) : (
            <Save className="ml-2 h-4 w-4" />
          )}
          حفظ المحضر
        </Button>
      </div>
    </div>
  );
};
