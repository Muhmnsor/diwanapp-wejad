
import React from 'react';
import { useParams } from 'react-router-dom';
import { MeetingDetails } from '@/components/meetings/MeetingDetails';

const MeetingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <div className="p-8 text-center">معرف الاجتماع غير صالح</div>;
  }

  return <MeetingDetails meetingId={id} />;
};

export default MeetingDetailsPage;
