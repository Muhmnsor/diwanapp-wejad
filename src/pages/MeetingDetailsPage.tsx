
import React from 'react';
import { useParams } from 'react-router-dom';
import { MeetingDetails } from '@/components/meetings/MeetingDetails';

interface MeetingDetailsPageProps {
  // This component doesn't need props as it gets the ID from URL params
}

const MeetingDetailsPage: React.FC<MeetingDetailsPageProps> = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <div className="p-8 text-center">معرف الاجتماع غير صالح</div>;
  }

  return <MeetingDetails meetingId={id} />;
};

export default MeetingDetailsPage;
