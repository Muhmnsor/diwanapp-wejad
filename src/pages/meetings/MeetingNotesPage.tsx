
import React from "react";
import { useParams } from "react-router-dom";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { MeetingNotesTab } from "@/components/meetings/content/MeetingNotesTab";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMeeting } from "@/hooks/meetings/useMeeting";

const MeetingNotesPage = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const { data: meeting, isLoading } = useMeeting(meetingId || "");
  
  if (!meetingId) {
    return <div>معرّف الاجتماع غير موجود</div>;
  }

  return (
    <div className="min-h-screen flex flex-col rtl" dir="rtl">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-6 flex-grow">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {isLoading ? "جاري التحميل..." : meeting?.title || "محضر الاجتماع"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MeetingNotesTab meetingId={meetingId} />
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default MeetingNotesPage;
