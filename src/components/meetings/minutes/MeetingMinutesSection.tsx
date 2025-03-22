
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Printer, FileDown, UserPlus, Users } from "lucide-react";
import { useMeetingMinutes } from "@/hooks/meetings/useMeetingMinutes";
import { useUpdateMeetingMinutes } from "@/hooks/meetings/useUpdateMeetingMinutes";
import { useMeetingAgendaItems } from "@/hooks/meetings/useMeetingAgendaItems";
import { toast } from "sonner";
import { MeetingMinutesItemsList } from "./MeetingMinutesItemsList";
import { MeetingAttendeesList } from "./MeetingAttendeesList";

interface MeetingMinutesSectionProps {
  meetingId: string;
}

export const MeetingMinutesSection: React.FC<MeetingMinutesSectionProps> = ({ meetingId }) => {
  const { data: minutes, isLoading: isLoadingMinutes, error: minutesError } = useMeetingMinutes(meetingId);
  const { data: agendaItems, isLoading: isLoadingAgenda } = useMeetingAgendaItems(meetingId);
  const updateMinutesMutation = useUpdateMeetingMinutes();
  
  const [generalNotes, setGeneralNotes] = useState<string>("");
  const [attendees, setAttendees] = useState<string[]>([]);
  const [newAttendee, setNewAttendee] = useState<string>("");
  const [isEditingGeneral, setIsEditingGeneral] = useState<boolean>(false);
  const [isEditingAttendees, setIsEditingAttendees] = useState<boolean>(false);

  // Update local state when data is loaded
  useEffect(() => {
    if (minutes) {
      setGeneralNotes(minutes.content || "");
      setAttendees(minutes.attendees || []);
    }
  }, [minutes]);

  const handleSaveGeneralNotes = async () => {
    try {
      await updateMinutesMutation.mutateAsync({
        meetingId,
        content: generalNotes
      });
      setIsEditingGeneral(false);
      toast.success("تم حفظ الملاحظات العامة بنجاح");
    } catch (error) {
      console.error("Error saving general notes:", error);
      toast.error("حدث خطأ أثناء حفظ الملاحظات العامة");
    }
  };

  const handleSaveAttendees = async () => {
    try {
      await updateMinutesMutation.mutateAsync({
        meetingId,
        attendees
      });
      setIsEditingAttendees(false);
      toast.success("تم حفظ قائمة الحضور بنجاح");
    } catch (error) {
      console.error("Error saving attendees:", error);
      toast.error("حدث خطأ أثناء حفظ قائمة الحضور");
    }
  };

  const handleAddAttendee = () => {
    if (newAttendee.trim()) {
      setAttendees([...attendees, newAttendee.trim()]);
      setNewAttendee("");
    }
  };

  const handleRemoveAttendee = (index: number) => {
    const newAttendees = [...attendees];
    newAttendees.splice(index, 1);
    setAttendees(newAttendees);
  };

  const handlePrintMinutes = () => {
    window.print();
  };

  const handleExportMinutes = () => {
    // Placeholder for export functionality
    toast.info("سيتم تنفيذ وظيفة التصدير قريباً");
  };

  if (isLoadingMinutes || isLoadingAgenda) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>محضر الاجتماع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">جاري تحميل محضر الاجتماع...</div>
        </CardContent>
      </Card>
    );
  }

  if (minutesError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>محضر الاجتماع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">حدث خطأ أثناء تحميل محضر الاجتماع</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">محضر الاجتماع</h2>
        <div className="flex gap-2 print:hidden">
          <Button onClick={handlePrintMinutes} variant="outline" size="sm">
            <Printer className="h-4 w-4 ml-1" />
            طباعة
          </Button>
          <Button onClick={handleExportMinutes} variant="outline" size="sm">
            <FileDown className="h-4 w-4 ml-1" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Attendees Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 ml-2" />
            الحضور
          </CardTitle>
          {!isEditingAttendees ? (
            <Button onClick={() => setIsEditingAttendees(true)} variant="outline" size="sm" className="print:hidden">تعديل</Button>
          ) : (
            <div className="flex gap-2 print:hidden">
              <Button 
                onClick={handleSaveAttendees} 
                variant="default" 
                size="sm" 
                disabled={updateMinutesMutation.isPending}
              >
                <Save className="h-4 w-4 ml-1" />
                حفظ
              </Button>
              <Button 
                onClick={() => {
                  setIsEditingAttendees(false);
                  setAttendees(minutes?.attendees || []);
                }} 
                variant="outline" 
                size="sm"
              >
                إلغاء
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <MeetingAttendeesList 
            attendees={attendees}
            isEditing={isEditingAttendees}
            onRemove={handleRemoveAttendee}
          />
          
          {isEditingAttendees && (
            <div className="mt-4 flex gap-2 print:hidden">
              <Input
                value={newAttendee}
                onChange={(e) => setNewAttendee(e.target.value)}
                placeholder="اسم الحاضر"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAttendee();
                  }
                }}
              />
              <Button 
                onClick={handleAddAttendee} 
                variant="secondary"
                size="icon"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agenda Items Minutes */}
      {agendaItems && agendaItems.length > 0 ? (
        <MeetingMinutesItemsList meetingId={meetingId} agendaItems={agendaItems} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>بنود جدول الأعمال</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-center py-2">
              لا توجد بنود في جدول الأعمال لهذا الاجتماع
            </p>
          </CardContent>
        </Card>
      )}

      {/* General Notes Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>ملاحظات عامة</CardTitle>
          {!isEditingGeneral ? (
            <Button onClick={() => setIsEditingGeneral(true)} variant="outline" size="sm" className="print:hidden">تعديل</Button>
          ) : (
            <div className="flex gap-2 print:hidden">
              <Button 
                onClick={handleSaveGeneralNotes} 
                variant="default" 
                size="sm" 
                disabled={updateMinutesMutation.isPending}
              >
                <Save className="h-4 w-4 ml-1" />
                حفظ
              </Button>
              <Button 
                onClick={() => {
                  setIsEditingGeneral(false);
                  setGeneralNotes(minutes?.content || "");
                }} 
                variant="outline" 
                size="sm"
              >
                إلغاء
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isEditingGeneral ? (
            <Textarea
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="أدخل ملاحظات عامة هنا..."
              className="min-h-[150px] resize-none p-4 leading-relaxed"
            />
          ) : (
            <div className="min-h-[100px] bg-gray-50 rounded-md p-4 whitespace-pre-wrap">
              {generalNotes ? (
                <div className="leading-relaxed">{generalNotes}</div>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  لا توجد ملاحظات عامة. انقر على "تعديل" لإضافة ملاحظات.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
