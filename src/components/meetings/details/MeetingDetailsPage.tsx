
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Edit, Trash, Users } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useMeeting } from "@/hooks/meetings/useMeeting";
import { MeetingDetailsTab } from "@/components/meetings/details/MeetingDetailsTab";
import { MeetingTasksSection } from "@/components/meetings/tasks/MeetingTasksSection";
import { MeetingMinutesContent } from "@/components/meetings/minutes/MeetingMinutesContent";
import { DeleteMeetingDialog, EditMeetingDialog, AddParticipantDialog } from "@/components/meetings/dialogs/MeetingDialogs";
import "../minutes/print-styles.css";

export const MeetingDetailsPage = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { data: meeting, isLoading, error, refetch } = useMeeting(meetingId as string);
  
  const [activeTab, setActiveTab] = useState("details");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);

  const handleGoBack = () => {
    if (meeting?.folder_id) {
      navigate(`/admin/meetings/folder/${meeting.folder_id}`);
    } else {
      navigate("/admin/meetings");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <AdminHeader />
        <div className="container mx-auto px-4 py-8 flex-grow text-right">
          <div className="text-center py-12">جاري تحميل تفاصيل الاجتماع...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <AdminHeader />
        <div className="container mx-auto px-4 py-8 flex-grow text-right">
          <Button variant="outline" onClick={handleGoBack} className="mb-4 flex items-center">
            <ArrowLeft className="h-4 w-4 ml-2" />
            العودة
          </Button>
          <div className="text-destructive py-4 text-right">
            {error ? `حدث خطأ: ${error.message}` : "الاجتماع غير موجود"}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const meetingDate = new Date(meeting.date);
  const formattedDate = format(meetingDate, "EEEE d MMMM yyyy", { locale: ar });

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-6 flex-grow">
        <div className="flex items-center mb-4 print:hidden">
          <Button variant="outline" onClick={handleGoBack} className="ml-4 flex items-center">
            <ArrowLeft className="h-4 w-4 ml-2" />
            العودة
          </Button>
          <h1 className="text-2xl font-bold text-right">
            {meeting.title}
          </h1>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6 text-right">
          <div className="flex justify-between items-start mb-6 print:hidden">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsParticipantsOpen(true)} className="flex items-center">
                <Users className="h-4 w-4 ml-2" />
                المشاركون
              </Button>
              <Button variant="outline" onClick={() => setIsEditOpen(true)} className="flex items-center">
                <Edit className="h-4 w-4 ml-2" />
                تعديل
              </Button>
              <Button 
                variant="outline" 
                className="text-destructive hover:bg-destructive/10 border-destructive flex items-center"
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash className="h-4 w-4 ml-2" />
                حذف
              </Button>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-2 text-right">{meeting.title}</h2>
              <div className="flex items-center text-muted-foreground mb-1 flex-row-reverse justify-end">
                <span>{formattedDate}</span>
                <Calendar className="h-4 w-4 ml-2 mr-2" />
                <span className="mx-2">|</span>
                <span>{meeting.start_time}</span>
                <span className="mx-2">|</span>
                <span>{meeting.duration} دقيقة</span>
              </div>
              <div className="text-muted-foreground text-right">
                {meeting.location && (
                  <div className="mb-1">المكان: {meeting.location}</div>
                )}
                {meeting.meeting_link && (
                  <div className="mb-1">رابط الاجتماع: {meeting.meeting_link}</div>
                )}
                {meeting.folder_name && (
                  <div className="mb-1">التصنيف: {meeting.folder_name}</div>
                )}
              </div>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="print:hidden" dir="rtl">
            <TabsList className="mb-4 justify-start">
              <TabsTrigger value="details">التفاصيل</TabsTrigger>
              <TabsTrigger value="tasks">مهام الاجتماع</TabsTrigger>
              <TabsTrigger value="minutes">محضر الاجتماع</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <MeetingDetailsTab meetingId={meetingId as string} />
            </TabsContent>
            
            <TabsContent value="tasks">
              <MeetingTasksSection meetingId={meetingId as string} />
            </TabsContent>
            
            <TabsContent value="minutes">
              <MeetingMinutesContent meetingId={meetingId as string} />
            </TabsContent>
          </Tabs>
          
          <div className="hidden print:block text-right">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">{meeting.title}</h1>
              <p className="text-gray-600">{formattedDate} | {meeting.start_time} | {meeting.duration} دقيقة</p>
              {meeting.location && <p className="text-gray-600">المكان: {meeting.location}</p>}
            </div>
            <MeetingMinutesContent meetingId={meetingId as string} />
          </div>
        </div>
      </div>
      
      <Footer />
      
      <EditMeetingDialog
        meeting={meeting}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={refetch}
      />
      
      <DeleteMeetingDialog
        meetingId={meeting.id}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onSuccess={() => handleGoBack()}
      />
      
      <AddParticipantDialog
        meetingId={meeting.id}
        open={isParticipantsOpen}
        onOpenChange={setIsParticipantsOpen}
      />
    </div>
  );
};

export default MeetingDetailsPage;
