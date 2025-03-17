
import { useParams, useNavigate } from "react-router-dom";
import { useMeetingDetails } from "@/hooks/meetings/useMeetingDetails";
import { useMeetingParticipants } from "@/hooks/meetings/useMeetingParticipants";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { DeveloperToolbar } from "@/components/developer/DeveloperToolbar";
import { Loader2, ArrowRight, Calendar, Clock, MapPin, Video, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { MeetingParticipantsList } from "@/components/meetings/participants/MeetingParticipantsList";
import { MeetingAgendaList } from "@/components/meetings/agenda/MeetingAgendaList";

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

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-green-100 text-green-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "scheduled": return "مجدول";
      case "in_progress": return "جاري";
      case "completed": return "مكتمل";
      case "cancelled": return "ملغي";
      default: return status || "غير محدد";
    }
  };

  if (isMeetingLoading) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <AdminHeader />
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
        <div className="container mx-auto px-4 py-8 flex-grow">
          <div className="text-center p-8 text-destructive">
            <p>حدث خطأ أثناء تحميل تفاصيل الاجتماع</p>
            <p className="text-sm mt-2">{meetingError?.message || "لم يتم العثور على الاجتماع"}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate("/admin/meetings/list")}
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              العودة إلى قائمة الاجتماعات
            </Button>
          </div>
        </div>
        <Footer />
        <DeveloperToolbar />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{meeting.title}</h1>
              <Badge className={getStatusColor(meeting.meeting_status)}>
                {getStatusLabel(meeting.meeting_status)}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-2">
              {meeting.objectives || "لا يوجد وصف للاجتماع"}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/admin/meetings/list")}>
              <ArrowRight className="mr-2 h-4 w-4" />
              العودة للقائمة
            </Button>
            <Button>
              تعديل الاجتماع
            </Button>
          </div>
        </div>
        
        <div className="bg-muted/10 p-6 rounded-lg border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">التاريخ</p>
                <p className="font-medium">
                  {meeting.date ? 
                    format(parseISO(meeting.date), 'EEEE d MMMM yyyy', { locale: ar }) : 
                    'غير محدد'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">الوقت والمدة</p>
                <p className="font-medium">
                  {meeting.start_time || 'غير محدد'} 
                  {meeting.duration ? ` (${meeting.duration} دقيقة)` : ''}
                </p>
              </div>
            </div>
            
            {meeting.attendance_type === 'in_person' && meeting.location ? (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">المكان</p>
                  <p className="font-medium">{meeting.location}</p>
                </div>
              </div>
            ) : meeting.attendance_type === 'virtual' ? (
              <div className="flex items-center gap-3">
                <Video className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">نوع الحضور</p>
                  <p className="font-medium">اجتماع افتراضي</p>
                  {meeting.meeting_link && (
                    <a 
                      href={meeting.meeting_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      رابط الاجتماع
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">نوع الحضور</p>
                  <p className="font-medium">اجتماع مختلط</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
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
            <div className="bg-muted/20 p-8 rounded-lg border text-center">
              <p>قرارات الاجتماع ستظهر هنا</p>
              <p className="text-sm text-muted-foreground mt-2">
                سيتم إضافة مكون قرارات الاجتماع قريباً
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="minutes">
            <div className="bg-muted/20 p-8 rounded-lg border text-center">
              <p>محاضر الاجتماع ستظهر هنا</p>
              <p className="text-sm text-muted-foreground mt-2">
                سيتم إضافة مكون محاضر الاجتماع قريباً
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="tasks">
            <div className="bg-muted/20 p-8 rounded-lg border text-center">
              <p>مهام الاجتماع ستظهر هنا</p>
              <p className="text-sm text-muted-foreground mt-2">
                سيتم إضافة مكون مهام الاجتماع قريباً
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="attachments">
            <div className="bg-muted/20 p-8 rounded-lg border text-center">
              <p>مرفقات الاجتماع ستظهر هنا</p>
              <p className="text-sm text-muted-foreground mt-2">
                سيتم إضافة مكون مرفقات الاجتماع قريباً
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
      <DeveloperToolbar />
    </div>
  );
};

export default MeetingDetailsPage;
