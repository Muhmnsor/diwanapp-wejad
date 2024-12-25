import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ReportTextSection } from "./reports/ReportTextSection";
import { PhotosSection } from "./reports/PhotosSection";
import { LinksSection } from "./reports/LinksSection";

interface EventReportFormProps {
  eventId: string;
  onSuccess?: () => void;
}

export const EventReportForm = ({ eventId, onSuccess }: EventReportFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportText, setReportText] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [videoLinks, setVideoLinks] = useState<string[]>([]);
  const [additionalLinks, setAdditionalLinks] = useState<string[]>([]);
  const [currentVideoLink, setCurrentVideoLink] = useState("");
  const [currentAdditionalLink, setCurrentAdditionalLink] = useState("");
  const queryClient = useQueryClient();

  const handlePhotoUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `event-reports/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      setPhotos(prev => [...prev, publicUrl]);
      toast.success("تم رفع الصورة بنجاح");
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error("حدث خطأ أثناء رفع الصورة");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("يجب تسجيل الدخول لإضافة تقرير");
        return;
      }

      const { error } = await supabase
        .from('event_reports')
        .insert({
          event_id: eventId,
          executor_id: user.id,
          report_text: reportText,
          photos,
          video_links: videoLinks,
          additional_links: additionalLinks
        });

      if (error) throw error;

      toast.success("تم إضافة التقرير بنجاح");
      await queryClient.invalidateQueries({ queryKey: ['event-reports', eventId] });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error("حدث خطأ أثناء إضافة التقرير");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      <ReportTextSection value={reportText} onChange={setReportText} />
      <PhotosSection photos={photos} onPhotoUpload={handlePhotoUpload} />
      
      <LinksSection
        title="روابط الفيديو"
        placeholder="أدخل رابط الفيديو"
        links={videoLinks}
        currentLink={currentVideoLink}
        onLinkChange={setCurrentVideoLink}
        onAddLink={() => {
          if (currentVideoLink) {
            setVideoLinks(prev => [...prev, currentVideoLink]);
            setCurrentVideoLink("");
          }
        }}
      />

      <LinksSection
        title="روابط إضافية"
        placeholder="أدخل رابط إضافي (استبيانات، مواد تدريبية، إلخ)"
        links={additionalLinks}
        currentLink={currentAdditionalLink}
        onLinkChange={setCurrentAdditionalLink}
        onAddLink={() => {
          if (currentAdditionalLink) {
            setAdditionalLinks(prev => [...prev, currentAdditionalLink]);
            setCurrentAdditionalLink("");
          }
        }}
      />

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "جاري إرسال التقرير..." : "إرسال التقرير"}
      </Button>
    </form>
  );
};