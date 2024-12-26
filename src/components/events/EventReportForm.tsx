import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ReportTextSection } from "./reports/ReportTextSection";
import { PhotosSection } from "./reports/PhotosSection";
import { LinksSection } from "./reports/LinksSection";
import { FeedbackLink } from "./feedback/FeedbackLink";
import { FeedbackSummary } from "./feedback/FeedbackSummary";

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
  const [files, setFiles] = useState<File[]>([]);
  const queryClient = useQueryClient();

  const handlePhotoUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `event-reports/${fileName}`;

      const { error: uploadError } = await supabase.storage
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

  const handlePhotoDelete = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    toast.success("تم حذف الصورة بنجاح");
  };

  const handleFileUpload = (file: File) => {
    setFiles(prev => [...prev, file]);
    toast.success("تم إضافة الملف بنجاح");
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

      // Upload files
      const uploadedFiles: string[] = [];
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `event-report-files/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('event-images')
          .getPublicUrl(filePath);

        uploadedFiles.push(publicUrl);
      }

      const { error } = await supabase
        .from('event_reports')
        .insert({
          event_id: eventId,
          executor_id: user.id,
          report_text: reportText,
          photos,
          video_links: videoLinks,
          additional_links: additionalLinks,
          files: uploadedFiles
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
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">رابط التقييم</h3>
        <FeedbackLink eventId={eventId} />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">نتائج التقييم</h3>
        <FeedbackSummary eventId={eventId} />
      </div>

      <ReportTextSection value={reportText} onChange={setReportText} />
      
      <PhotosSection 
        photos={photos} 
        onPhotoUpload={handlePhotoUpload}
        onPhotoDelete={handlePhotoDelete}
        maxPhotos={6}
        photoPlaceholders={[
          "صورة توثيقية للحضور",
          "صورة للمتحدث الرئيسي",
          "صورة لقاعة الفعالية",
          "صورة للأنشطة التفاعلية",
          "صورة للمشاركين",
          "صورة ختامية للفعالية"
        ]}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium">تحميل الملفات</label>
        <input 
          type="file" 
          multiple 
          onChange={(e) => {
            if (e.target.files) {
              Array.from(e.target.files).forEach(handleFileUpload);
            }
          }} 
        />
        {files.length > 0 && (
          <ul className="list-disc list-inside space-y-1">
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        )}
      </div>

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