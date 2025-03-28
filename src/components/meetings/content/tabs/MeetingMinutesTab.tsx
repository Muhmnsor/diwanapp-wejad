
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Save, Paperclip, Download, Upload, Clock, Calendar, User as UserIcon } from "lucide-react";
import { useMeeting } from "@/hooks/meetings/useMeeting";
import { useMeetingParticipants } from "@/hooks/meetings/useMeetingParticipants";
import { useMeetingAgendaItems, MeetingAgendaItem } from "@/hooks/meetings/useMeetingAgendaItems";
import { useMeetingMinutes, useSaveMeetingMinutes, MeetingMinutes } from "@/hooks/meetings/useMeetingMinutes";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useAuthStore } from "@/store/refactored-auth";
import { MinutesParticipantsTable } from "../../participants/MinutesParticipantsTable";
import { SignatureTable } from "../../participants/SignatureTable";
import { ExportButton } from "@/components/admin/ExportButton";
import { formatDateWithDay, formatTime12Hour } from "@/utils/dateTimeUtils";

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
  
  // Prepare export data
  const prepareExportData = () => {
    if (!meeting || !agendaItems || !minutes) return [];
    
    const exportData = [
      { title: 'محضر اجتماع', content: meeting.title },
      { title: 'تاريخ الاجتماع', content: formatDateWithDay(meeting.date) },
      { title: 'وقت الاجتماع', content: formatTime12Hour(meeting.start_time) },
      { title: 'المقدمة', content: minutes.introduction || '' }
    ];
    
    // Add agenda items
    agendaItems.forEach(item => {
      exportData.push({
        title: `بند: ${item.content}`,
        content: minutes.agenda_notes?.[item.id] || ''
      });
    });
    
    exportData.push({ title: 'الخاتمة', content: minutes.conclusion || '' });
    exportData.push({ title: 'كاتب المحضر', content: minutes.author_name || user?.display_name || '' });
    
    return exportData;
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
  
  if (!meeting) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>محضر الاجتماع</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">لا يمكن تحميل بيانات الاجتماع</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" id="meeting-minutes">
      {/* Meeting Details Section */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span>محضر اجتماع: {meeting.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="font-medium ml-1">تاريخ الاجتماع:</span>
              <span>{formatDateWithDay(meeting.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="font-medium ml-1">وقت الاجتماع:</span>
              <span>{formatTime12Hour(meeting.start_time)}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-gray-500" />
              <span className="font-medium ml-1">كاتب المحضر:</span>
              <span>{minutes.author_name || user?.display_name || user?.email || 'غير محدد'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="font-medium ml-1">تاريخ كتابة المحضر:</span>
              <span>{currentDateTime}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Participants List - Added after meeting details */}
      <MinutesParticipantsTable meetingId={meetingId} />

      {/* Introduction Section */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>المقدمة</CardTitle>
        </CardHeader>
        <CardContent>
          {isPreviewMode ? (
            <div className="p-4 border rounded bg-gray-50 min-h-[100px] whitespace-pre-wrap">
              {minutes.introduction || 'لا توجد مقدمة'}
            </div>
          ) : (
            <Textarea
              placeholder="اكتب مقدمة المحضر هنا..."
              className="min-h-[150px] resize-y"
              value={minutes.introduction || ''}
              onChange={(e) => handleInputChange(e, 'introduction')}
              dir="rtl"
            />
          )}
        </CardContent>
      </Card>

      {/* Agenda Items Section with Notes */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>بنود الاجتماع والملاحظات</CardTitle>
        </CardHeader>
        <CardContent>
          {agendaItems && agendaItems.length > 0 ? (
            <div className="space-y-4">
              {agendaItems.map((item: MeetingAgendaItem) => (
                <div key={item.id} className="border rounded p-4">
                  <h3 className="font-medium text-gray-800 mb-2">
                    {item.order_number}. {item.content}
                  </h3>
                  {isPreviewMode ? (
                    <div className="p-3 border rounded bg-gray-50 min-h-[80px] whitespace-pre-wrap">
                      {minutes.agenda_notes?.[item.id] || 'لا توجد ملاحظات'}
                    </div>
                  ) : (
                    <Textarea
                      placeholder="اكتب الملاحظات حول هذا البند هنا..."
                      className="min-h-[100px] resize-y"
                      value={minutes.agenda_notes?.[item.id] || ''}
                      onChange={(e) => handleAgendaNotesChange(item.id, e.target.value)}
                      dir="rtl"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">لا توجد بنود في جدول الأعمال</p>
          )}
        </CardContent>
      </Card>

      {/* Conclusion Section */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>الخاتمة</CardTitle>
        </CardHeader>
        <CardContent>
          {isPreviewMode ? (
            <div className="p-4 border rounded bg-gray-50 min-h-[100px] whitespace-pre-wrap">
              {minutes.conclusion || 'لا توجد خاتمة'}
            </div>
          ) : (
            <Textarea
              placeholder="اكتب خاتمة المحضر هنا..."
              className="min-h-[150px] resize-y"
              value={minutes.conclusion || ''}
              onChange={(e) => handleInputChange(e, 'conclusion')}
              dir="rtl"
            />
          )}
        </CardContent>
      </Card>
      
      {/* Signatures Table - Only show when there's a conclusion */}
      {(minutes.conclusion || isPreviewMode) && (
        <SignatureTable meetingId={meetingId} />
      )}

      {/* Actions Footer */}
      <Card>
        <CardFooter className="flex justify-between py-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={togglePreviewMode}
            >
              {isPreviewMode ? 'تحرير المحضر' : 'عرض المحضر'}
            </Button>
            <ExportButton
              data={prepareExportData()}
              filename={`محضر-اجتماع-${meeting.title}`}
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            حفظ المحضر
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
