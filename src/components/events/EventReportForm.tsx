import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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

  const handleAddVideoLink = () => {
    if (currentVideoLink) {
      setVideoLinks(prev => [...prev, currentVideoLink]);
      setCurrentVideoLink("");
    }
  };

  const handleAddAdditionalLink = () => {
    if (currentAdditionalLink) {
      setAdditionalLinks(prev => [...prev, currentAdditionalLink]);
      setCurrentAdditionalLink("");
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
      <div className="space-y-2">
        <label className="block text-sm font-medium">نص التقرير</label>
        <Textarea
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
          placeholder="اكتب ملخصاً للفعالية متضمناً عدد الحضور، النجاحات، التحديات، وتعليقات المشاركين"
          className="h-32"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">صور الفعالية</label>
        <ImageUpload onChange={handlePhotoUpload} value={photos[photos.length - 1]} />
        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`صورة ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">روابط الفيديو</label>
        <div className="flex gap-2">
          <Input
            value={currentVideoLink}
            onChange={(e) => setCurrentVideoLink(e.target.value)}
            placeholder="أدخل رابط الفيديو"
          />
          <Button type="button" onClick={handleAddVideoLink}>
            إضافة
          </Button>
        </div>
        {videoLinks.length > 0 && (
          <ul className="list-disc list-inside space-y-1">
            {videoLinks.map((link, index) => (
              <li key={index}>
                <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">روابط إضافية</label>
        <div className="flex gap-2">
          <Input
            value={currentAdditionalLink}
            onChange={(e) => setCurrentAdditionalLink(e.target.value)}
            placeholder="أدخل رابط إضافي (استبيانات، مواد تدريبية، إلخ)"
          />
          <Button type="button" onClick={handleAddAdditionalLink}>
            إضافة
          </Button>
        </div>
        {additionalLinks.length > 0 && (
          <ul className="list-disc list-inside space-y-1">
            {additionalLinks.map((link, index) => (
              <li key={index}>
                <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "جاري إرسال التقرير..." : "إرسال التقرير"}
      </Button>
    </form>
  );
};