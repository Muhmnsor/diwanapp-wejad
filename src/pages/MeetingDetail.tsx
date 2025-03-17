
import React from 'react';
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { MeetingDetails } from "@/components/MeetingDetails";
import { useParams } from "react-router-dom";
import { SecondaryHeader } from "@/components/meetings/navigation/SecondaryHeader";

const MeetingDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <div>Meeting ID is required</div>;
  }

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      <SecondaryHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <MeetingDetails meetingId={id} />
      </div>

      <Footer />
    </div>
  );
};

export default MeetingDetail;
