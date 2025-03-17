
import { useParams } from "react-router-dom";
import { useMeetingDetails } from "@/hooks/meetings/useMeetingDetails";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { DeveloperToolbar } from "@/components/developer/DeveloperToolbar";
import { Loader2 } from "lucide-react";

const MeetingDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    data: meeting, 
    isLoading, 
    error 
  } = useMeetingDetails(id);

  if (isLoading) {
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

  if (error || !meeting) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <AdminHeader />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <div className="text-center p-8 text-destructive">
            <p>حدث خطأ أثناء تحميل تفاصيل الاجتماع</p>
            <p className="text-sm mt-2">{error?.message || "لم يتم العثور على الاجتماع"}</p>
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{meeting.title}</h1>
          <p className="text-muted-foreground mt-2">
            {meeting.objectives || "لا يوجد وصف للاجتماع"}
          </p>
        </div>
        
        {/* Placeholder for meeting details components */}
        <div className="bg-muted/20 p-8 rounded-lg border text-center">
          <p>تفاصيل الاجتماع ستظهر هنا</p>
          <p className="text-sm text-muted-foreground mt-2">
            سيتم إضافة مكونات تفاصيل الاجتماع قريباً
          </p>
        </div>
      </div>

      <Footer />
      <DeveloperToolbar />
    </div>
  );
};

export default MeetingDetailsPage;
