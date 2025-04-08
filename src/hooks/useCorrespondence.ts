
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Correspondence {
  id: string;
  number: string;
  subject: string;
  sender: string;
  recipient: string;
  date: string;
  status: string;
  type: string;
  content?: string;
  creation_date?: string;
}

interface CorrespondenceAttachment {
  id: string;
  correspondence_id: string;
  file_name: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  is_main_document?: boolean;
  uploaded_at?: string;
}

interface History {
  id: string;
  correspondence_id: string;
  action_type: string;
  action_by?: string;
  action_date?: string;
  action_details?: string;
  previous_status?: string;
  new_status?: string;
}

export const useCorrespondence = () => {
  const [correspondence, setCorrespondence] = useState<Correspondence[]>([]);
  const [attachments, setAttachments] = useState<{[key: string]: CorrespondenceAttachment[]}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCorrespondence = async () => {
      try {
        setLoading(true);
        
        // Fetch correspondence data
        const { data: correspondenceData, error: correspondenceError } = await supabase
          .from('correspondence')
          .select('*')
          .order('creation_date', { ascending: false });
        
        if (correspondenceError) {
          throw correspondenceError;
        }

        // Transform data into the required format if needed
        const formattedData = correspondenceData.map(item => ({
          id: item.id,
          number: item.number,
          subject: item.subject,
          sender: item.sender,
          recipient: item.recipient,
          date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
          status: item.status,
          type: item.type,
          content: item.content,
          creation_date: item.creation_date
        }));
        
        setCorrespondence(formattedData);

        // Fetch attachments for all correspondence
        const attachmentsMap: {[key: string]: CorrespondenceAttachment[]} = {};
        
        const { data: attachmentsData, error: attachmentsError } = await supabase
          .from('correspondence_attachments')
          .select('*');
          
        if (attachmentsError) {
          console.error("Error fetching attachments:", attachmentsError);
        } else if (attachmentsData) {
          // Group attachments by correspondence ID
          attachmentsData.forEach((attachment) => {
            if (!attachmentsMap[attachment.correspondence_id]) {
              attachmentsMap[attachment.correspondence_id] = [];
            }
            attachmentsMap[attachment.correspondence_id].push(attachment);
          });
        }
        
        setAttachments(attachmentsMap);
      } catch (err) {
        console.error("Error fetching correspondence:", err);
        setError("Failed to fetch correspondence data");
      } finally {
        setLoading(false);
      }
    };

    fetchCorrespondence();
  }, []);

  const hasAttachments = (id: string) => {
    return attachments[id] && attachments[id].length > 0;
  };

  const getAttachments = async (correspondenceId: string) => {
    if (attachments[correspondenceId]) {
      return attachments[correspondenceId];
    }
    
    try {
      const { data, error } = await supabase
        .from('correspondence_attachments')
        .select('*')
        .eq('correspondence_id', correspondenceId);
        
      if (error) throw error;
      
      // Update the attachments state
      setAttachments(prev => ({
        ...prev,
        [correspondenceId]: data || []
      }));
      
      return data || [];
    } catch (err) {
      console.error("Error fetching attachments:", err);
      return [];
    }
  };

  const getHistory = async (correspondenceId: string) => {
    try {
      const { data, error } = await supabase
        .from('correspondence_history')
        .select('*')
        .eq('correspondence_id', correspondenceId)
        .order('action_date', { ascending: false });
        
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error("Error fetching history:", err);
      return [];
    }
  };

  const downloadAttachment = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('attachments')
        .download(filePath);
        
      if (error) throw error;
      
      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (err) {
      console.error("Error downloading attachment:", err);
      return false;
    }
  };

  return {
    correspondence,
    attachments,
    loading,
    error,
    hasAttachments,
    getAttachments,
    getHistory,
    downloadAttachment
  };
};

export type { Correspondence, CorrespondenceAttachment, History };
