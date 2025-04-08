
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Attachment {
  id: string;
  correspondence_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  is_main_document: boolean;
  uploaded_at: string;
  uploaded_by: string;
}

export interface Correspondence {
  id: string;
  number: string;
  subject: string;
  content: string;
  sender: string;
  recipient: string;
  date: string;
  creation_date: string;
  status: string;
  type: string;
  priority: string;
  is_confidential: boolean;
  tags: string[];
  assigned_to?: string;
  related_correspondence_id?: string;
  created_by?: string;
  hasAttachments?: boolean;
  attachments?: Attachment[];
}

export const useCorrespondence = () => {
  const [filter, setFilter] = useState({
    type: "",
    status: "",
    dateRange: { from: null, to: null } as { from: Date | null; to: null | Date },
  });

  // Fetch all correspondence
  const { data: correspondence, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["correspondence", filter],
    queryFn: async () => {
      try {
        let query = supabase
          .from("correspondence")
          .select(`
            *,
            attachments:correspondence_attachments(*)
          `)
          .order("creation_date", { ascending: false });

        // Apply filters if they exist
        if (filter.type) {
          query = query.eq("type", filter.type);
        }
        
        if (filter.status) {
          query = query.eq("status", filter.status);
        }
        
        if (filter.dateRange.from) {
          query = query.gte("date", filter.dateRange.from.toISOString().split('T')[0]);
        }
        
        if (filter.dateRange.to) {
          query = query.lte("date", filter.dateRange.to.toISOString().split('T')[0]);
        }

        const { data, error } = await query;
        
        if (error) throw error;

        // Process the data to add hasAttachments property
        const processedData = data.map(item => ({
          ...item,
          hasAttachments: item.attachments && item.attachments.length > 0,
        }));

        return processedData as Correspondence[];
      } catch (error: any) {
        console.error("Error fetching correspondence:", error);
        throw error;
      }
    },
  });

  // Download attachment function
  const downloadAttachment = async (attachment: Attachment) => {
    try {
      const { data, error } = await supabase.storage
        .from("correspondence_files")
        .download(attachment.file_path);

      if (error) throw error;

      // Create a blob URL and trigger download
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading attachment:", error);
      toast.error("حدث خطأ أثناء تحميل الملف");
    }
  };

  // View correspondence details
  const viewCorrespondence = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("correspondence")
        .select(`
          *,
          attachments:correspondence_attachments(*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      return {
        ...data,
        hasAttachments: data.attachments && data.attachments.length > 0,
      } as Correspondence;
    } catch (error) {
      console.error("Error fetching correspondence details:", error);
      throw error;
    }
  };

  return {
    correspondence,
    isLoading,
    isError,
    error,
    refetch,
    setFilter,
    filter,
    downloadAttachment,
    viewCorrespondence
  };
};
