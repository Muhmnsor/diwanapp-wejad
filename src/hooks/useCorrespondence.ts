
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface Correspondence {
  id: string;
  number: string;
  subject: string;
  sender: string;
  recipient: string;
  date: string;
  status: string;
  type: string;
  content?: string;
  priority?: string;
  is_confidential?: boolean;
  tags?: string[];
  related_correspondence_id?: string;
  created_by?: string;
  assigned_to?: string;
  creation_date?: string;
}

export interface Attachment {
  id: string;
  correspondence_id: string;
  file_name: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  uploaded_at: string;
  uploaded_by?: string;
  is_main_document?: boolean;
}

export interface Distribution {
  id: string;
  correspondence_id: string;
  distributed_by: string;
  distributed_to: string;
  distributed_to_department?: string;
  distribution_date: string;
  status: string;
  instructions?: string;
  response_text?: string | null;
  response_deadline?: string | null;
  response_date?: string | null;
  is_read: boolean;
  read_at?: string | null;
  distributed_by_user?: {
    display_name: string;
    email?: string;
  };
  distributed_to_user?: {
    display_name: string;
    email?: string;
  };
}

export interface HistoryEntry {
  id: string;
  correspondence_id: string;
  action_type: string;
  action_by: string;
  action_date: string;
  previous_status?: string;
  new_status?: string;
  action_details?: string;
  action_by_user?: {
    display_name: string;
  };
}

export const useCorrespondence = (correspondenceId?: string | null) => {
  const [correspondence, setCorrespondence] = useState<Correspondence | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [relatedCorrespondence, setRelatedCorrespondence] = useState<Correspondence | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [assignedToUser, setAssignedToUser] = useState<any | null>(null);
  const [createdByUser, setCreatedByUser] = useState<any | null>(null);

  const loadCorrespondenceDetails = async () => {
    if (!correspondenceId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Load main correspondence data
      const { data: correspondenceData, error } = await supabase
        .from("correspondence")
        .select("*")
        .eq("id", correspondenceId)
        .single();

      if (error) {
        throw error;
      }

      setCorrespondence(correspondenceData);

      // Load attachments
      const { data: attachmentsData, error: attachmentsError } = await supabase
        .from("correspondence_attachments")
        .select("*")
        .eq("correspondence_id", correspondenceId);

      if (attachmentsError) {
        throw attachmentsError;
      }
      
      setAttachments(attachmentsData || []);

      // Load distribution information
      const { data: distributionsData, error: distributionsError } = await supabase
        .from("correspondence_distribution")
        .select(`
          *,
          distributed_by_user:distributed_by(id, display_name, email),
          distributed_to_user:distributed_to(id, display_name, email)
        `)
        .eq("correspondence_id", correspondenceId);

      if (distributionsError) {
        throw distributionsError;
      }

      setDistributions(distributionsData || []);

      // Load history
      const { data: historyData, error: historyError } = await supabase
        .from("correspondence_history")
        .select(`
          *,
          action_by_user:action_by(display_name)
        `)
        .eq("correspondence_id", correspondenceId)
        .order("action_date", { ascending: false });

      if (historyError) {
        throw historyError;
      }

      setHistory(historyData || []);

      // Load related correspondence if there's a related_correspondence_id
      if (correspondenceData.related_correspondence_id) {
        const { data: relatedData, error: relatedError } = await supabase
          .from("correspondence")
          .select("id, number, subject, date, type")
          .eq("id", correspondenceData.related_correspondence_id)
          .single();

        if (!relatedError) {
          setRelatedCorrespondence(relatedData);
        }
      }

      // Load assigned user data if there's an assigned_to field
      if (correspondenceData.assigned_to) {
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("id, display_name, email")
          .eq("id", correspondenceData.assigned_to)
          .single();

        if (!userError) {
          setAssignedToUser(userData);
        }
      }

      // Load created by user data
      if (correspondenceData.created_by) {
        const { data: creatorData, error: creatorError } = await supabase
          .from("profiles")
          .select("id, display_name, email")
          .eq("id", correspondenceData.created_by)
          .single();

        if (!creatorError) {
          setCreatedByUser(creatorData);
        }
      }
      
    } catch (err: any) {
      console.error("Error loading correspondence details:", err);
      setError(err);
      toast({
        variant: "destructive",
        title: "خطأ في تحميل بيانات المعاملة",
        description: err.message || "حدث خطأ أثناء محاولة تحميل تفاصيل المعاملة"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadAttachment = async (attachment: Attachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('correspondence')
        .download(attachment.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Error downloading file:', error);
      toast({
        variant: "destructive",
        title: "خطأ في تحميل الملف",
        description: error.message || "حدث خطأ أثناء محاولة تحميل الملف"
      });
    }
  };

  useEffect(() => {
    if (correspondenceId) {
      loadCorrespondenceDetails();
    }
  }, [correspondenceId]);

  return {
    correspondence,
    attachments,
    distributions,
    history,
    relatedCorrespondence,
    assignedToUser,
    createdByUser,
    loading,
    error,
    downloadAttachment,
    refresh: loadCorrespondenceDetails
  };
};
