
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMeeting } from "@/hooks/meetings/useMeeting";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Loader2 } from "lucide-react";
import { MeetingDetailsTab } from "@/components/meetings/content/MeetingDetailsTab";
import { MeetingTasks } from "@/components/meetings/content/MeetingTasks";
import { MeetingMinutes } from "@/components/meetings/content/MeetingMinutes";

export const MeetingDetailsPage = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { data: meeting, isLoading, error } = useMeeting(meetingId || "");
  const [activeTab, setActiveTab] = useState("details");
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  const handleBack = () => {
    navigate(-1);
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-lg">جاري تحميل تفاصيل الاجتماع...</p>
      </div>
    );
  }
  
  if (error || !meeting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-red-500 text-lg">حدث خطأ أثناء تحميل تفاصيل الاجتماع</p>
        <p className="text-muted-foreground">{error?.message || "الاجتماع غير موجود"}</p>
        <Button onClick={handleBack} className="mt-4" variant="outline">
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-2 -mr-4 p-2"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{meeting.title}</h1>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full justify-start max-w-md mb-6">
          <TabsTrigger value="details" className="flex-1">التفاصيل</TabsTrigger>
          <TabsTrigger value="tasks" className="flex-1">المهام</TabsTrigger>
          <TabsTrigger value="minutes" className="flex-1">المحضر</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <MeetingDetailsTab meeting={meeting} />
        </TabsContent>
        
        <TabsContent value="tasks">
          <MeetingTasks meetingId={meeting.id} />
        </TabsContent>
        
        <TabsContent value="minutes">
          <MeetingMinutes meetingId={meeting.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
