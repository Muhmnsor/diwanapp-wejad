
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ActivityFeedbackForm } from "../ActivityFeedbackForm";

export const ActivityFeedbackFormContainer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: {
    overallRating: number | null;
    contentRating: number | null;
    organizationRating: number | null;
    presenterRating: number | null;
  }) => {
    console.log('Submitting activity feedback:', formData);
    
    if (!id) {
      toast.error('معرف النشاط غير موجود');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('activity_feedback').insert({
        project_activity_id: id,
        overall_rating: formData.overallRating,
        content_rating: formData.contentRating,
        organization_rating: formData.organizationRating,
        presenter_rating: formData.presenterRating
      });

      if (error) throw error;

      toast.success('تم إرسال التقييم بنجاح');
      
      // Wait for toast to be visible before redirecting
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('حدث خطأ أثناء إرسال التقييم');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ActivityFeedbackForm
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    />
  );
};
