
import { useState } from "react";
import { useMeetings } from "@/hooks/meetings/useMeetings";
import { MeetingsList } from "@/components/meetings/MeetingsList";
import { useNavigate } from "react-router-dom";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { DeveloperToolbar } from "@/components/developer/DeveloperToolbar";

const MeetingsPage = () => {
  const navigate = useNavigate();
  const { data: meetings = [], isLoading, error, refetch } = useMeetings();
  
  const handleCreateMeeting = () => {
    refetch();
  };

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <MeetingsList
          meetings={meetings}
          isLoading={isLoading}
          error={error as Error}
          onCreate={handleCreateMeeting}
        />
      </div>

      <Footer />
      <DeveloperToolbar />
    </div>
  );
};

export default MeetingsPage;
