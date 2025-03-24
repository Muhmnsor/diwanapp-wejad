import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { useMeeting } from "@/hooks/meetings/useMeeting";
import { useDeleteMeeting } from "@/hooks/meetings/useDeleteMeeting";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit, Trash } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MeetingDetailsTabs } from "@/components/meetings/content/MeetingDetailsTabs";
const MeetingDetailsPage = () => {
  const {
    meetingId
  } = useParams<{
    meetingId: string;
  }>();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const {
    data: meeting,
    isLoading: isMeetingLoading,
    error: meetingError
  } = useMeeting(meetingId || '');
  const {
    mutate: deleteMeeting,
    isPending: isDeleting
  } = useDeleteMeeting();
  const handleBack = () => {
    navigate(-1);
  };
  const handleEdit = () => {
    // Edit functionality will be implemented later
    console.log('Edit meeting:', meetingId);
  };
  const handleDelete = () => {
    if (meetingId) {
      deleteMeeting(meetingId, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          navigate('/admin/meetings');
        }
      });
    }
  };
  if (isMeetingLoading) {
    return <div className="min-h-screen flex flex-col rtl" dir="rtl">
        <AdminHeader />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <div className="flex items-center mb-8">
            <Button variant="ghost" size="sm" onClick={handleBack} className="ml-4">
              <ArrowLeft className="h-4 w-4 ml-2" />
              عودة
            </Button>
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 md:col-span-2" />
            <Skeleton className="h-64" />
          </div>
        </div>
        <Footer />
      </div>;
  }
  if (meetingError || !meeting) {
    return <div className="min-h-screen flex flex-col rtl" dir="rtl">
        <AdminHeader />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">خطأ في تحميل بيانات الاجتماع</h2>
              <p className="text-gray-600 mb-6">{(meetingError as Error)?.message || 'لم يتم العثور على الاجتماع المطلوب'}</p>
              <Button onClick={handleBack}>العودة</Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>;
  }
  return <div className="min-h-screen flex flex-col rtl" dir="rtl">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        {/* Header with back button and title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 px-0">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={handleBack} className="ml-4">
              <ArrowLeft className="h-4 w-4 ml-2" />
              عودة
            </Button>
            <h1 className="text-2xl font-bold">{meeting.title}</h1>
          </div>
          
          
        </div>
        
        {/* Meeting status badge */}
        <div className="mb-6">
          <Badge className={meeting.meeting_status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-200' : meeting.meeting_status === 'in_progress' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : meeting.meeting_status === 'cancelled' ? 'bg-red-100 text-red-800 hover:bg-red-200' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}>
            {meeting.meeting_status === 'completed' ? 'مكتمل' : meeting.meeting_status === 'in_progress' ? 'جاري حالياً' : meeting.meeting_status === 'cancelled' ? 'ملغي' : 'قادم'}
          </Badge>
          
          <Badge className="mr-2 bg-gray-100 text-gray-800 hover:bg-gray-200">
            {meeting.meeting_type === 'board' ? 'مجلس إدارة' : meeting.meeting_type === 'department' ? 'قسم' : meeting.meeting_type === 'team' ? 'فريق عمل' : meeting.meeting_type === 'committee' ? 'لجنة' : 'أخرى'}
          </Badge>
        </div>
        
        {/* Main content with tabs */}
        <MeetingDetailsTabs meeting={meeting} meetingId={meetingId || ''} />
      </div>
      
      <Footer />
    </div>;
};
export default MeetingDetailsPage;