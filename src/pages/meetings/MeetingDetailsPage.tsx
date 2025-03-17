
import { useParams, useNavigate } from "react-router-dom";
import { useMeetingDetails } from "@/hooks/meetings/useMeetingDetails";
import { useMeetingParticipants } from "@/hooks/meetings/useMeetingParticipants";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { DeveloperToolbar } from "@/components/developer/DeveloperToolbar";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MeetingParticipantsList } from "@/components/meetings/participants/MeetingParticipantsList";
import { MeetingAgendaList } from "@/components/meetings/agenda/MeetingAgendaList";
import { MeetingDecisionsList } from "@/components/meetings/decisions/MeetingDecisionsList";
import { MeetingMinutesList } from "@/components/meetings/minutes/MeetingMinutesList";
import { MeetingTasksList } from "@/components/meetings/tasks/MeetingTasksList";
import { MeetingAttachmentsList } from "@/components/meetings/attachments/MeetingAttachmentsList";
import { MeetingHeaderEnhanced } from "@/components/meetings/MeetingHeaderEnhanced";
import { MeetingInfo } from "@/components/meetings/MeetingInfo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { MeetingsNavHeader } from "@/components/meetings/MeetingsNavHeader";

const MeetingDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    data: meeting, 
    isLoading: isMeetingLoading, 
    error: meetingError 
  } = useMeetingDetails(id);
  
  const {
    data: participants = [],
    isLoading: isParticipantsLoading,
    error: participantsError
  } = useMeetingParticipants(id);

  if (isMeetingLoading) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <AdminHeader />
        <MeetingsNavHeader meetingId={id} />
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span>جاري تحميل تفاصيل الاجتماع...</span>
        </div>
        <Footer />
        <DeveloperToolbar />
      </div>
    );
  }

  if (meetingError || !meeting) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <AdminHeader />
        <MeetingsNavHeader />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>خطأ</AlertTitle>
            <AlertDescription>
              حدث خطأ أثناء تحميل تفاصيل الاجتماع: {meetingError?.message || "لم يتم العثور على الاجتماع"}
            </AlertDescription>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate("/admin/meetings/list")}
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              العودة إلى قائمة الاجتماعات
            </Button>
          </Alert>
        </div>
        <Footer />
        <DeveloperToolbar />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      <MeetingsNavHeader meetingId={id} />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <MeetingHeaderEnhanced meeting={meeting} />
        
        <MeetingInfo meeting={meeting} />
        
        <Tabs defaultValue="participants" className="w-full">
          <TabsList className="w-full justify-start mb-6">
            <TabsTrigger value="participants">المشاركون</TabsTrigger>
            <TabsTrigger value="agenda">جدول الأعمال</TabsTrigger>
            <TabsTrigger value="decisions">القرارات</TabsTrigger>
            <TabsTrigger value="minutes">المحاضر</TabsTrigger>
            <TabsTrigger value="tasks">المهام</TabsTrigger>
            <TabsTrigger value="attachments">المرفقات</TabsTrigger>
          </TabsList>
          
          <TabsContent value="participants">
            <MeetingParticipantsList 
              participants={participants} 
              isLoading={isParticipantsLoading} 
              error={participantsError} 
              meetingId={id}
            />
          </TabsContent>
          
          <TabsContent value="agenda">
            <MeetingAgendaList meetingId={id} />
          </TabsContent>
          
          <TabsContent value="decisions">
            <MeetingDecisionsList meetingId={id} />
          </TabsContent>
          
          <TabsContent value="minutes">
            <MeetingMinutesList meetingId={id} />
          </TabsContent>
          
          <TabsContent value="tasks">
            <MeetingTasksList meetingId={id} />
          </TabsContent>
          
          <TabsContent value="attachments">
            <MeetingAttachmentsList meetingId={id} />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
      <DeveloperToolbar />
    </div>
  );
};

export default MeetingDetailsPage;
