import { FC, useState } from "react";
import { useParams } from "react-router-dom";
import { EventFeedbackForm } from "@/components/events/feedback/EventFeedbackForm";

const EventFeedback: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      // Handle form submission
      console.log('Submitting feedback:', formData);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!id) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <EventFeedbackForm 
        eventId={id}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default EventFeedback;