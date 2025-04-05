import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Save, Paperclip, Eye, Download, Upload, Clock, Calendar, User as UserIcon } from "lucide-react";
import { useMeeting } from "@/hooks/meetings/useMeeting";
import { useMeetingParticipants } from "@/hooks/meetings/useMeetingParticipants";
import { useMeetingAgendaItems, MeetingAgendaItem } from "@/hooks/meetings/useMeetingAgendaItems";
import { useMeetingMinutes, useSaveMeetingMinutes, MeetingMinutes } from "@/hooks/meetings/useMeetingMinutes";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useAuthStore } from "@/store/refactored-auth";
interface MeetingMinutesTabProps {
  meetingId: string;
}
export const MeetingMinutesTab: React.FC<MeetingMinutesTabProps> = ({
  meetingId
}) => {
  // Fetch meeting data
  const {
    data: meeting,
    isLoading: isMeetingLoading
  } = useMeeting(meetingId);
  const {
    data: participants,
    isLoading: isParticipantsLoading
  } = useMeetingParticipants(meetingId);
  const {
    data: agendaItems,
    isLoading: isAgendaItemsLoading
  } = useMeetingAgendaItems(meetingId);
  const {
    data: existingMinutes,
    isLoading: isMinutesLoading
  } = useMeetingMinutes(meetingId);

  // Current user info
  const {
    user
  } = useAuthStore();

  // Mutation for saving minutes
  const {
    mutate: saveMinutes,
    isPending: isSaving
  } = useSaveMeetingMinutes();

  // State for the minutes form
  const [minutes, setMinutes] = useState<MeetingMinutes>({
    meeting_id: meetingId,
    introduction: '',
    conclusion: '',
    agenda_notes: {},
    attachments: []
  });

  // Preview mode toggle
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Current date and time formatted for display
  const currentDateTime = format(new Date(), "EEEE dd MMMM yyyy الساعة hh:mm a", {
    locale: ar
  });

  // Initialize form with existing data when loaded
  useEffect(() => {
    if (existingMinutes && !isMinutesLoading) {
      setMinutes(existingMinutes);
    }
  }, [existingMinutes, isMinutesLoading]);

  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, field: string) => {
    setMinutes(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  // Handle agenda item notes changes
  const handleAgendaNotesChange = (agendaItemId: string, notes: string) => {
    setMinutes(prev => ({
      ...prev,
      agenda_notes: {
        ...(prev.agenda_notes || {}),
        [agendaItemId]: notes
      }
    }));
  };

  // Handle save button click
  const handleSave = () => {
    saveMinutes({
      ...minutes,
      author_id: user?.id,
      author_name: user?.display_name || user?.email
    });
  };

  // Handle toggle preview mode
  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode);
  };
  const isLoading = isMeetingLoading || isParticipantsLoading || isAgendaItemsLoading || isMinutesLoading;
  if (isLoading) {
    return <Card>
        <CardHeader className="pb-3">
          <CardTitle>محضر الاجتماع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </CardContent>
      </Card>;
  }
  return <Card className="mb-6">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle>محضر الاجتماع</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={togglePreviewMode}>
            {isPreviewMode ? <>تحرير المحضر</> : <><Eye className="h-4 w-4 ml-1" /> معاينة</>}
          </Button>
          <Button disabled={isSaving} onClick={handleSave} size="sm">
            <Save className="h-4 w-4 ml-1" />
            حفظ المحضر
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6" dir="rtl">
          {/* Meeting Details Section */}
          <section className="border rounded-md p-4 bg-gray-50">
            <h3 className="text-lg font-medium mb-3">تفاصيل الاجتماع</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">عنوان الاجتماع</p>
                <p className="font-medium">{meeting?.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">التاريخ والوقت</p>
                <p className="font-medium">
                  {meeting?.date} - {meeting?.start_time} (لمدة {meeting?.duration} دقيقة)
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">المكان</p>
                <p className="font-medium">{meeting?.location || meeting?.meeting_link || "غير محدد"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">حالة الاجتماع</p>
                <p className="font-medium">{meeting?.meeting_status === 'scheduled' ? 'مجدول' : meeting?.meeting_status === 'in_progress' ? 'قيد التنفيذ' : meeting?.meeting_status === 'completed' ? 'مكتمل' : meeting?.meeting_status === 'cancelled' ? 'ملغى' : 'غير محدد'}</p>
              </div>
            </div>
          </section>
          
          {/* Participants Section */}
          
          
          {/* Introduction Section */}
          <section className="border rounded-md p-4">
            <h3 className="text-lg font-medium mb-3">المقدمة</h3>
            {isPreviewMode ? <div className="p-3 bg-gray-50 rounded min-h-24 whitespace-pre-wrap">
                {minutes.introduction || 'لا توجد مقدمة مسجلة'}
              </div> : <Textarea value={minutes.introduction || ''} onChange={e => handleInputChange(e, 'introduction')} placeholder="اكتب مقدمة محضر الاجتماع هنا..." className="min-h-24 text-right" />}
          </section>
          
          {/* Agenda Items Section */}
          <section className="border rounded-md p-4">
            <h3 className="text-lg font-medium mb-3">بنود الاجتماع</h3>
            {agendaItems && agendaItems.length > 0 ? <div className="space-y-4">
                {agendaItems.map((item: MeetingAgendaItem) => <div key={item.id} className="border-b pb-4 last:border-b-0">
                    <h4 className="font-medium mb-2">{item.order_number}. {item.content}</h4>
                    {isPreviewMode ? <div className="p-3 bg-gray-50 rounded min-h-16 whitespace-pre-wrap">
                        {minutes.agenda_notes?.[item.id] || 'لا توجد ملاحظات مسجلة لهذا البند'}
                      </div> : <Textarea value={minutes.agenda_notes?.[item.id] || ''} onChange={e => handleAgendaNotesChange(item.id, e.target.value)} placeholder={`اكتب ملاحظات حول البند "${item.content}" هنا...`} className="min-h-16 text-right" />}
                  </div>)}
              </div> : <p className="text-gray-500 py-2">لا توجد بنود مسجلة لهذا الاجتماع</p>}
          </section>
          
          {/* Conclusion Section */}
          <section className="border rounded-md p-4">
            <h3 className="text-lg font-medium mb-3">الخاتمة</h3>
            {isPreviewMode ? <div className="p-3 bg-gray-50 rounded min-h-24 whitespace-pre-wrap">
                {minutes.conclusion || 'لا توجد خاتمة مسجلة'}
              </div> : <Textarea value={minutes.conclusion || ''} onChange={e => handleInputChange(e, 'conclusion')} placeholder="اكتب خاتمة محضر الاجتماع هنا..." className="min-h-24 text-right" />}
          </section>
          
          {/* Attachments Section */}
          <section className="border rounded-md p-4">
            <h3 className="text-lg font-medium mb-3">المرفقات</h3>
            <p className="text-gray-500 mb-2">
              <Paperclip className="h-4 w-4 inline-block ml-1" />
              المرفقات الداعمة (ستتوفر قريباً)
            </p>
            <div className="bg-gray-100 border border-dashed border-gray-300 rounded-md p-6 text-center">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">ستتوفر إمكانية إضافة المرفقات قريباً</p>
            </div>
          </section>
          
          {/* Author Information */}
          <section className="border rounded-md p-4 bg-gray-50">
            <h3 className="text-lg font-medium mb-3">معلومات كاتب المحضر</h3>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <UserIcon className="h-5 w-5 text-gray-500" />
                <span className="font-medium">{user?.display_name || user?.email || "مستخدم النظام"}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <span>{currentDateTime.split('الساعة')[0]}</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <span>الساعة {currentDateTime.split('الساعة')[1]}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-4" dir="rtl">
        <Button variant="outline" className="ml-2" disabled={true}>
          <Download className="h-4 w-4 ml-1" />
          تصدير إلى PDF
        </Button>
        <Button disabled={isSaving} onClick={handleSave}>
          <Save className="h-4 w-4 ml-1" />
          حفظ المحضر
        </Button>
      </CardFooter>
    </Card>;
};