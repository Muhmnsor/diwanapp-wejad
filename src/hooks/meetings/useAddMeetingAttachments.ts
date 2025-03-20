
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

interface TempAttachment {
  temp_id: string;
  file: File;
  file_name: string;
  file_type: string;
  file_size: number;
  upload_progress: number;
}

interface UseAddMeetingAttachmentsResult {
  attachments: TempAttachment[];
  addAttachment: (file: File) => void;
  removeAttachment: (id: string) => void;
  uploadAttachments: (meetingId: string) => Promise<boolean>;
  isUploading: boolean;
}

export const useAddMeetingAttachments = (): UseAddMeetingAttachmentsResult => {
  const [attachments, setAttachments] = useState<TempAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const addAttachment = (file: File) => {
    // Check if file with the same name already exists
    const exists = attachments.some(a => a.file_name === file.name);
    if (exists) {
      toast.error(`الملف ${file.name} موجود بالفعل`);
      return;
    }

    const tempAttachment: TempAttachment = {
      temp_id: uuidv4(),
      file,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      upload_progress: 0
    };

    setAttachments(prev => [...prev, tempAttachment]);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.temp_id !== id));
  };

  const uploadAttachments = async (meetingId: string): Promise<boolean> => {
    if (!meetingId || attachments.length === 0) return true;

    setIsUploading(true);
    let success = true;

    try {
      for (const attachment of attachments) {
        // Upload file to storage
        const filePath = `meetings/${meetingId}/${attachment.file_name}`;
        const { error: uploadError } = await supabase.storage
          .from("meeting_attachments")
          .upload(filePath, attachment.file);

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("meeting_attachments")
          .getPublicUrl(filePath);

        // Add record to database
        const { error: dbError } = await supabase.from("meeting_attachments").insert({
          meeting_id: meetingId,
          file_name: attachment.file_name,
          file_path: urlData.publicUrl,
          file_type: attachment.file_type,
          file_size: attachment.file_size,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        });

        if (dbError) {
          throw dbError;
        }
      }
    } catch (error) {
      console.error("Error uploading attachments:", error);
      toast.error("حدث خطأ أثناء رفع المرفقات");
      success = false;
    } finally {
      setIsUploading(false);
    }

    return success;
  };

  return {
    attachments,
    addAttachment,
    removeAttachment,
    uploadAttachments,
    isUploading
  };
};
