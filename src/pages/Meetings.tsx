
import React, { Suspense } from 'react';
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { MeetingsList } from "@/components/meetings/MeetingsList";
import { SecondaryHeader } from "@/components/meetings/navigation/SecondaryHeader";
import { ErrorBoundary } from "@/components/ui/error-boundary";

const Meetings = () => {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      <SecondaryHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <ErrorBoundary fallback={<p className="text-center py-8">حدث خطأ أثناء تحميل قائمة الاجتماعات</p>}>
          <Suspense fallback={<p className="text-center py-8">جاري التحميل...</p>}>
            <MeetingsList />
          </Suspense>
        </ErrorBoundary>
      </div>

      <Footer />
    </div>
  );
};

export default Meetings;
