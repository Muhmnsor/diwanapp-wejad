
import React from 'react';
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { MeetingsList } from "@/components/meetings/MeetingsList";
import { SecondaryHeader } from "@/components/meetings/navigation/SecondaryHeader";

const Meetings = () => {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      <SecondaryHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <MeetingsList />
      </div>

      <Footer />
    </div>
  );
};

export default Meetings;
