
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Footer } from '@/components/layout/Footer';
import { useMeeting } from '@/hooks/meetings/useMeeting';
import { MeetingDetailsTabs } from '@/components/meetings/content/MeetingDetailsTabs';
import { useDeleteMeeting } from '@/hooks/meetings/useDeleteMeeting';

const MeetingDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const meetingId = id as string;
  const { data: meeting, isLoading, error } = useMeeting(meetingId);
  const { mutate: deleteMeeting } = useDeleteMeeting();

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const handleBack = () => {
    navigate('/admin/meetings');
  };

  const handleEdit = () => {
    navigate(`/admin/meetings/edit/${meetingId}`);
  };

  const handleDelete = () => {
    deleteMeeting(meetingId, {
      onSuccess: () => {
        navigate('/admin/meetings');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col rtl" dir="rtl">
        <AdminHeader />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">جاري تحميل تفاصيل الاجتماع...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen flex flex-col rtl" dir="rtl">
        <AdminHeader />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <div className="flex justify-center items-center h-64 flex-col">
            <p className="text-red-500 font-bold text-lg">خطأ في تحميل بيانات الاجتماع</p>
            <button 
              onClick={handleBack}
              className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
            >
              العودة للاجتماعات
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col rtl" dir="rtl">
      <AdminHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        {/* MeetingDetailsTabs now contains all the necessary UI elements */}
        <MeetingDetailsTabs
          meeting={meeting}
          meetingId={meetingId}
          onBack={handleBack}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
      <Footer />
    </div>
  );
};

export default MeetingDetailsPage;
