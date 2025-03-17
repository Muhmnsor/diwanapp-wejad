
import React from 'react';
import { MeetingsList } from '@/components/meetings/MeetingsList';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Footer } from '@/components/layout/Footer';

const MeetingsPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <MeetingsList />
      </div>
      <Footer />
    </div>
  );
};

export default MeetingsPage;
