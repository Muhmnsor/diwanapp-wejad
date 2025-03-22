
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMeetings } from "@/hooks/meetings/useMeetings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParticipantsList } from "./participants/ParticipantsList";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  CalendarClock, 
  MapPin, 
  Clock, 
  Calendar, 
  Users, 
  FileText,
  Loader2 
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime, formatDuration } from "@/lib/dateUtils";

export const MeetingDetails = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const [activeTab, setActiveTab] = useState("details");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const { data: meetings, isLoading, error } = useMeetings(undefined, refreshTrigger);
  
  const meeting = meetings?.find(m => m.id === meetingId);
  
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  const getMeetingStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-50">مجدول</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-yellow-50">جاري</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50">مكتمل</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50">ملغي</Badge>;
      default:
        return <Badge variant="outline">غير معروف</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-primary ml-2" />
        <span>جاري تحميل تفاصيل الاجتماع...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4 ml-2" />
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>
          حدث خطأ أثناء تحميل تفاصيل الاجتماع: {error.message}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!meeting) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4 ml-2" />
        <AlertTitle>غير موجود</AlertTitle>
        <AlertDescription>
          الاجتماع المطلوب غير موجود
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">{meeting.title}</CardTitle>
              <CardDescription>
                {meeting.folder?.name && (
                  <span className="ml-2">المجلد: {meeting.folder.name}</span>
                )}
                {getMeetingStatusBadge(meeting.meeting_status)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 ml-2 text-muted-foreground" />
              <span className="font-medium">التاريخ:</span>
              <span className="mr-2">{formatDate(meeting.date)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 ml-2 text-muted-foreground" />
              <span className="font-medium">الوقت:</span>
              <span className="mr-2">{formatTime(meeting.start_time)}</span>
            </div>
            <div className="flex items-center">
              <CalendarClock className="h-5 w-5 ml-2 text-muted-foreground" />
              <span className="font-medium">المدة:</span>
              <span className="mr-2">{formatDuration(meeting.duration)}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 ml-2 text-muted-foreground" />
              <span className="font-medium">المكان:</span>
              <span className="mr-2">{meeting.location}</span>
            </div>
          </div>
          
          {meeting.description && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">الوصف</h3>
              <p className="text-muted-foreground">{meeting.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="details">
            <FileText className="h-4 w-4 ml-2" />
            التفاصيل
          </TabsTrigger>
          <TabsTrigger value="participants">
            <Users className="h-4 w-4 ml-2" />
            المشاركون
          </TabsTrigger>
          <TabsTrigger value="decisions">
            <FileText className="h-4 w-4 ml-2" />
            القرارات
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الاجتماع</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {meeting.objectives && (
                  <div>
                    <h3 className="font-medium mb-2">الأهداف</h3>
                    <p className="text-muted-foreground">{meeting.objectives}</p>
                  </div>
                )}
                
                {meeting.agenda && (
                  <div>
                    <h3 className="font-medium mb-2">جدول الأعمال</h3>
                    <p className="text-muted-foreground whitespace-pre-line">{meeting.agenda}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="participants">
          {meetingId && <ParticipantsList meetingId={meetingId} />}
        </TabsContent>
        
        <TabsContent value="decisions">
          <Card>
            <CardHeader>
              <CardTitle>قرارات الاجتماع</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                لا توجد قرارات مسجلة لهذا الاجتماع
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
