import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ReportTextSection } from "./reports/ReportTextSection";
import { PhotosSection } from "./reports/PhotosSection";
import { LinksSection } from "./reports/LinksSection";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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
  const [satisfactionLevel, setSatisfactionLevel] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const queryClient = useQueryClient();

  const handlePhotoUpload = async (file: File) => {
    if (photos.length >= 6) {
      toast.error("لا يمكن إضافة أكثر من 6 صور");
      return;
    }

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
          satisfaction_level: satisfactionLevel,
          comments: comments,
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
      <ReportTextSection value={reportText} onChange={setReportText} />
      
      <PhotosSection 
        photos={photos} 
        onPhotoUpload={handlePhotoUpload} 
        maxPhotos={6} 
      />
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">مستوى الرضا</label>
        <Select 
          value={satisfactionLevel?.toString() || ""} 
          onValueChange={(value) => setSatisfactionLevel(Number(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر مستوى الرضا" />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5].map(level => (
              <SelectItem key={level} value={level.toString()}>
                {level} من 5
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">التعليقات</label>
        <div className="flex gap-2">
          <Input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="أدخل تعليقًا"
          />
          <Button 
            type="button" 
            onClick={() => {
              if (comment.trim()) {
                setComments(prev => [...prev, comment.trim()]);
                setComment("");
              }
            }}
          >
            إضافة
          </Button>
        </div>
        {comments.length > 0 && (
          <ul className="list-disc list-inside space-y-1">
            {comments.map((comm, index) => (
              <li key={index}>{comm}</li>
            ))}
          </ul>
        )}
      </div>

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