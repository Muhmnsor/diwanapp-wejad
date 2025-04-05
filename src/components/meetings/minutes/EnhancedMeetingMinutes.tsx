
import React, { useEffect, useState } from 'react';
import { SignatureTable } from '../participants/SignatureTable';
import { MinutesParticipantsTable } from '../participants/MinutesParticipantsTable';
import { MeetingMinutes, useSaveMeetingMinutes } from '@/hooks/meetings/useMeetingMinutes';
import { Meeting } from '@/types/meeting';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Save, Download, Paperclip } from 'lucide-react';
import { useMeetingAgendaItems } from '@/hooks/meetings/useMeetingAgendaItems';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useAuthStore } from '@/store/refactored-auth';

interface EnhancedMeetingMinutesProps {
  meetingId: string;
  meeting: Meeting;
  minutes: MeetingMinutes | undefined;
  isLoading: boolean;
}

export const EnhancedMeetingMinutes: React.FC<EnhancedMeetingMinutesProps> = ({
  meetingId,
  meeting,
  minutes,
  isLoading
}) => {
  const { data: agendaItems, isLoading: isAgendaLoading } = useMeetingAgendaItems(meetingId);
  const { mutate: saveMinutes } = useSaveMeetingMinutes();
  const { user } = useAuthStore();
  
  // State for editable fields
  const [introduction, setIntroduction] = useState<string>('');
  const [conclusion, setConclusion] = useState<string>('');
  const [agendaNotes, setAgendaNotes] = useState<Record<string, string>>({});
  
  // Initialize state from minutes data when available
  useEffect(() => {
    if (minutes) {
      setIntroduction(minutes.introduction || '');
      setConclusion(minutes.conclusion || '');
      setAgendaNotes(minutes.agenda_notes || {});
    }
  }, [minutes]);
  
  // Handle saving the minutes
  const handleSave = () => {
    const updatedMinutes: MeetingMinutes = {
      meeting_id: meetingId,
      introduction,
      conclusion,
      agenda_notes: agendaNotes,
      author_id: user?.id || minutes?.author_id,
      author_name: user?.display_name || minutes?.author_name || user?.email,
      ...(minutes?.id ? { id: minutes.id } : {})
    };
    
    saveMinutes(updatedMinutes, {
      onSuccess: () => {
        toast.success('تم حفظ محضر الاجتماع بنجاح');
      },
      onError: (error) => {
        toast.error('حدث خطأ أثناء حفظ محضر الاجتماع');
        console.error('Error saving minutes:', error);
      }
    });
  };
  
  // Handle agenda note changes
  const handleAgendaNoteChange = (agendaItemId: string, content: string) => {
    setAgendaNotes(prev => ({
      ...prev,
      [agendaItemId]: content
    }));
  };
  
  // Handle export to PDF or other formats
  const handleExport = () => {
    // Implement the export functionality here
    toast.info('جاري تطوير وظيفة تصدير المحضر...');
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <span className="mr-2">جاري تحميل محضر الاجتماع...</span>
      </div>
    );
  }
  
  const currentDate = new Date();
  const formattedDate = format(currentDate, 'PPPP', { locale: ar });
  const formattedTime = format(currentDate, 'p', { locale: ar });

  return (
    <div className="space-y-6 rtl">
      {/* Meeting Details Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="ml-2 h-5 w-5" />
            تفاصيل الاجتماع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">عنوان الاجتماع</p>
              <p className="font-medium">{meeting.title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">نوع الاجتماع</p>
              <p className="font-medium">{meeting.meeting_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">التاريخ</p>
              <p className="font-medium">{meeting.date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">الوقت</p>
              <p className="font-medium">{meeting.start_time}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">المدة</p>
              <p className="font-medium">{meeting.duration} دقيقة</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">المكان</p>
              <p className="font-medium">{meeting.location || 'غير محدد'}</p>
            </div>
            {meeting.meeting_link && (
              <div className="col-span-2">
                <p className="text-sm text-gray-500">رابط الاجتماع</p>
                <p className="font-medium">{meeting.meeting_link}</p>
              </div>
            )}
            {meeting.objectives && (
              <div className="col-span-2">
                <p className="text-sm text-gray-500">أهداف الاجتماع</p>
                <p className="font-medium">{meeting.objectives}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Participants Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">المشاركون في الاجتماع</CardTitle>
        </CardHeader>
        <CardContent>
          <MinutesParticipantsTable meetingId={meetingId} />
        </CardContent>
      </Card>

      {/* Interactive Content Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">محتوى المحضر</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Introduction */}
          <div>
            <h3 className="text-md font-medium mb-2">مقدمة المحضر</h3>
            <Textarea 
              placeholder="أدخل مقدمة المحضر هنا..."
              className="min-h-[100px] w-full"
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
            />
          </div>

          <Separator />

          {/* Agenda Items */}
          <div>
            <h3 className="text-md font-medium mb-2">بنود الاجتماع</h3>
            {isAgendaLoading ? (
              <p>جاري تحميل بنود الاجتماع...</p>
            ) : agendaItems && agendaItems.length > 0 ? (
              <div className="space-y-4">
                {agendaItems.map((item) => (
                  <div key={item.id} className="border rounded-md p-4">
                    <div className="flex items-center mb-2">
                      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-primary text-white rounded-full text-xs">
                        {item.order_number}
                      </div>
                      <h4 className="mr-2 font-medium">{item.content}</h4>
                    </div>
                    <Textarea
                      placeholder="أدخل الملاحظات الخاصة بهذا البند..."
                      className="min-h-[80px] w-full"
                      value={agendaNotes[item.id] || ''}
                      onChange={(e) => handleAgendaNoteChange(item.id, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">لا يوجد بنود لهذا الاجتماع</p>
            )}
          </div>

          <Separator />

          {/* Conclusion */}
          <div>
            <h3 className="text-md font-medium mb-2">خاتمة المحضر</h3>
            <Textarea 
              placeholder="أدخل خاتمة المحضر هنا..."
              className="min-h-[100px] w-full"
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Attachments Section - Placeholder for future implementation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Paperclip className="ml-2 h-5 w-5" />
            مرفقات الاجتماع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الحجم</TableHead>
                <TableHead>إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500">
                  لا يوجد مرفقات للاجتماع حالياً
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Signature Table - Only appears when there is a conclusion */}
      {conclusion && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">توقيعات الحضور</CardTitle>
          </CardHeader>
          <CardContent>
            <SignatureTable meetingId={meetingId} />
          </CardContent>
        </Card>
      )}

      {/* Author Information */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center text-sm text-gray-600">
            <div>
              <p className="font-medium">كاتب المحضر: {user?.display_name || minutes?.author_name || 'غير محدد'}</p>
              <p>المسمى: {user?.position || 'غير محدد'}</p>
            </div>
            <div>
              <p>التاريخ: {formattedDate}</p>
              <p>الوقت: {formattedTime}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={handleExport}>
          <Download className="ml-2 h-4 w-4" />
          تصدير المحضر
        </Button>
        <Button onClick={handleSave}>
          <Save className="ml-2 h-4 w-4" />
          حفظ المحضر
        </Button>
      </div>
    </div>
  );
};
