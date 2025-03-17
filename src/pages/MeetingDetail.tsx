
import React, { useEffect } from 'react';
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { MeetingDetails } from "@/components/MeetingDetails";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { SecondaryHeader } from "@/components/meetings/navigation/SecondaryHeader";

const MeetingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Parse the tab from URL or default to "overview"
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'overview';
  
  // Handle invalid ID
  useEffect(() => {
    if (!id) {
      navigate('/meetings');
    }
  }, [id, navigate]);

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
