import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Save, Paperclip, Eye, Download, Upload, Clock, Calendar, MapPin, Link2, Users, FolderOpen, UserIcon } from "lucide-react";
import { useMeeting } from "@/hooks/meetings/useMeeting";
import { useMeetingParticipants } from "@/hooks/meetings/useMeetingParticipants";
import { useMeetingAgendaItems, MeetingAgendaItem } from "@/hooks/meetings/useMeetingAgendaItems";
import { useMeetingMinutes, useSaveMeetingMinutes, MeetingMinutes } from "@/hooks/meetings/useMeetingMinutes";
import { useMeetingObjectives } from "@/hooks/meetings/useMeetingObjectives";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useAuthStore } from "@/store/refactored-auth";
import { Badge } from "@/components/ui/badge";
import { formatTime12Hour } from "@/utils/dateTimeUtils";
import { formatDateWithDay } from "@/utils/dateTimeUtils";


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
  
  const {
    data: objectives,
    isLoading: isObjectivesLoading
  } = useMeetingObjectives(meetingId);

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
  
  const isLoading = isMeetingLoading || isParticipantsLoading || isAgendaItemsLoading || isMinutesLoading || isObjectivesLoading;
  
  // Meeting status mapping
  const getStatusText = (status: string) => {
    switch(status) {
      case 'scheduled': return 'مجدول';
      case 'in_progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغى';
      default: return 'غير محدد';
    }
  };
  
  // Meeting type mapping
  const getMeetingTypeText = (type: string) => {
    switch(type) {
      case 'board': return 'مجلس إدارة';
      case 'department': return 'قسم';
      case 'team': return 'فريق عمل';
      case 'committee': return 'لجنة';
      case 'other': return 'أخرى';
      default: return 'غير محدد';
    }
  };
  
  // Attendance type mapping
  const getAttendanceTypeText = (type: string) => {
    switch(type) {
      case 'in_person': return 'حضوري';
      case 'virtual': return 'عن بعد';
      case 'hybrid': return 'مختلط';
      default: return 'غير محدد';
    }
  };
  
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
          {/* Enhanced Meeting Details Section */}
          <section className="border rounded-md p-4 bg-gray-50">
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              تفاصيل الاجتماع
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Title */}
              <div className="col-span-3">
                <p className="text-sm text-gray-500">عنوان الاجتماع</p>
                <p className="font-medium text-lg">{meeting?.title}</p>
              </div>
              
              {/* Date */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">تاريخ الاجتماع</p>
                  <p className="font-medium">{formatDateArabic(meeting?.date)}</p>
                </div>
              </div>
              
              {/* Time */}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">الوقت والمدة</p>
                  <p className="font-semibold">{formatTime12Hour(meeting.start_time)} (المدة: {meeting.duration} دقيقة)</p>
                </div>
              </div>
              
              {/* Status */}
              <div>
                <p className="text-sm text-gray-500">حالة الاجتماع</p>
                <Badge variant="outline" className="mt-1">
                  {getStatusText(meeting?.meeting_status)}
                </Badge>
              </div>
              
              {/* Meeting Type */}
              <div>
                <p className="text-sm text-gray-500">نوع الاجتماع</p>
                <p className="font-medium">{getMeetingTypeText(meeting?.meeting_type)}</p>
              </div>
              
              {/* Attendance Type */}
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">نوع الحضور</p>
                  <p className="font-medium">{getAttendanceTypeText(meeting?.attendance_type)}</p>
                </div>
              </div>
              
              {/* Folder/Classification */}
              {meeting?.folder_name && (
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">التصنيف</p>
                    <p className="font-medium">{meeting?.folder_name}</p>
                  </div>
                </div>
              )}
              
              {/* Location (if available) */}
              {meeting?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">مكان الاجتماع</p>
                    <p className="font-medium">{meeting?.location}</p>
                  </div>
                </div>
              )}
              
              {/* Meeting Link (if available) */}
              {meeting?.meeting_link && (
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">رابط الاجتماع</p>
                    <a href={meeting?.meeting_link} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                      فتح الرابط
                    </a>
                  </div>
                </div>
              )}
              
              {/* Creator (if available) */}
              {meeting?.creator && (
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">منشئ الاجتماع</p>
                    <p className="font-medium">{meeting?.creator?.display_name || meeting?.creator?.email}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Objectives Section */}
            {objectives && objectives.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">أهداف الاجتماع:</h4>
                <ol className="list-decimal marker:text-primary list-inside space-y-1 pr-2">
                  {objectives.map(objective => (
                    <li key={objective.id} className="text-gray-800">
                      {objective.content}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </section>
          
          {/* Participants Section */}
          <section className="border rounded-md p-4">
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              المشاركون في الاجتماع
            </h3>
            {participants && participants.length > 0 ? (
              <div className="overflow-x-auto">
                <Table dir="rtl">
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>الصفة</TableHead>
                      <TableHead>الدور</TableHead>
                      <TableHead>حالة الحضور</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participants.map(participant => (
                      <TableRow key={participant.id}>
                        <TableCell className="font-medium">{participant.user_display_name}</TableCell>
                        <TableCell>{participant.title || "-"}</TableCell>
                        <TableCell>
                          {participant.role === 'chairman' ? 'رئيس الاجتماع' : 
                           participant.role === 'secretary' ? 'أمين السر' : 
                           participant.role === 'member' ? 'عضو' : 
                           participant.role === 'observer' ? 'مراقب' : 'مشارك'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            participant.attendance_status === 'attended' ? 'success' : 
                            participant.attendance_status === 'absent' ? 'destructive' : 
                            'secondary'
                          }>
                            {participant.attendance_status === 'attended' ? 'حضر' : 
                             participant.attendance_status === 'absent' ? 'غائب' : 
                             participant.attendance_status === 'confirmed' ? 'مؤكد' : 'معلق'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-gray-500 py-2">لا يوجد مشاركون مسجلون في هذا الاجتماع</p>
            )}
          </section>
          
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
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <Paperclip className="h-5 w-5 text-primary" />
              المرفقات
            </h3>
            <div className="bg-gray-100 border border-dashed border-gray-300 rounded-md p-6 text-center">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">ستتوفر إمكانية إضافة المرفقات قريباً</p>
            </div>
          </section>
          
          {/* Signature Table (show only for completed meetings) */}
          {meeting?.meeting_status === 'completed' && minutes.conclusion && (
            <section className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                توقيعات الحضور
              </h3>
              <div className="overflow-x-auto">
                <Table dir="rtl">
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>الصفة</TableHead>
                      <TableHead>التوقيع</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participants && participants.filter(p => p.attendance_status === 'attended').map(participant => (
                      <TableRow key={participant.id}>
                        <TableCell className="font-medium">{participant.user_display_name}</TableCell>
                        <TableCell>
                          {participant.role === 'chairman' ? 'رئيس الاجتماع' : 
                           participant.role === 'secretary' ? 'أمين السر' : 
                           participant.role === 'member' ? 'عضو' : 
                           participant.role === 'observer' ? 'مراقب' : 'مشارك'}
                        </TableCell>
                        <TableCell>
                          <div className="h-10 border border-dashed border-gray-300 rounded"></div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          )}
          
          {/* Author Information */}
          <section className="border rounded-md p-4 bg-gray-50">
            <h3 className="text-lg font-medium mb-3">معلومات كاتب المحضر</h3>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <UserIcon className="h-5 w-5 text-gray-500" />
                <span className="font-medium">{user?.display_name || user?.email || "مستخدم النظام"}</span>
                {user?.position && <span className="text-gray-500">({user.position})</span>}
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
