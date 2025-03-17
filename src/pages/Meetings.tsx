
import React from 'react';
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { MeetingsList } from "@/components/meetings/MeetingsList";

const Meetings = () => {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <MeetingsList />
      </div>

      <Footer />
    </div>
  );
};

export default Meetings;
