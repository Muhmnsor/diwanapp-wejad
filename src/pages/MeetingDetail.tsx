
import React, { useEffect, Suspense } from 'react';
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { MeetingDetails } from "@/components/MeetingDetails";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { SecondaryHeader } from "@/components/meetings/navigation/SecondaryHeader";
import { ErrorBoundary } from "@/components/ui/error-boundary";

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
        <ErrorBoundary fallback={<p className="text-center py-8">حدث خطأ أثناء تحميل بيانات الاجتماع</p>}>
          <Suspense fallback={<p className="text-center py-8">جاري التحميل...</p>}>
            <MeetingDetails meetingId={id} />
          </Suspense>
        </ErrorBoundary>
      </div>

      <Footer />
    </div>
  );
};

export default MeetingDetail;
