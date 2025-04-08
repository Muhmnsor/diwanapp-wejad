import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  creation_date?: string;
  is_confidential?: boolean;
}

export interface CorrespondenceAttachment {
  id: string;
  correspondence_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  is_main_document: boolean;
}

export const useCorrespondence = (type: string = 'all', filters: any = {}) => {
  const [correspondence, setCorrespondence] = useState<Correspondence[]>([]);
  const [attachments, setAttachments] = useState<{[key: string]: CorrespondenceAttachment[]}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCorrespondence = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('correspondence')
          .select('*')
          .order('creation_date', { ascending: false });

        // Apply type filter
        if (type !== 'all') {
          query = query.eq('type', type);
        }

        // Apply additional filters
        if (filters.searchQuery) {
          query = query.or(
            `subject.ilike.%${filters.searchQuery}%,` + 
            `sender.ilike.%${filters.searchQuery}%,` +
            `recipient.ilike.%${filters.searchQuery}%,` +
            `number.ilike.%${filters.searchQuery}%`
          );
        }

        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }

        if (filters.dateFilter) {
          if (filters.dateFilter === 'today') {
            const today = new Date().toISOString().split('T')[0];
            query = query.eq('date', today);
          } else if (filters.dateFilter === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            query = query.gte('date', weekAgo.toISOString().split('T')[0]);
          } else if (filters.dateFilter === 'month') {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            query = query.gte('date', monthAgo.toISOString().split('T')[0]);
          }
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        if (data) {
          // Format the data to match the expected format
          const formattedData = data.map(item => ({
            id: item.id,
            number: item.number,
            subject: item.subject,
            sender: item.sender,
            recipient: item.recipient,
            date: item.date,
            status: item.status,
            type: item.type,
            content: item.content,
            priority: item.priority,
            creation_date: item.creation_date,
            is_confidential: item.is_confidential
          }));

          setCorrespondence(formattedData);
          
          // Fetch attachments for each correspondence
          const attachmentsPromises = formattedData.map(async (item) => {
            const { data: attachmentsData, error: attachmentsError } = await supabase
              .from('correspondence_attachments')
              .select('*')
              .eq('correspondence_id', item.id);
              
            if (attachmentsError) {
              console.error('Error fetching attachments:', attachmentsError);
              return;
            }
            
            return { id: item.id, attachments: attachmentsData || [] };
          });
          
          const attachmentsResults = await Promise.all(attachmentsPromises);
          const attachmentsMap: {[key: string]: CorrespondenceAttachment[]} = {};
          
          attachmentsResults.forEach(result => {
            if (result) {
              attachmentsMap[result.id] = result.attachments;
            }
          });
          
          setAttachments(attachmentsMap);
        }
      } catch (err: any) {
        console.error('Error fetching correspondence:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCorrespondence();
  }, [type, filters]);

  return { 
    correspondence, 
    attachments, 
    loading, 
    error,
    hasAttachments: (id: string) => attachments[id] && attachments[id].length > 0
  };
};

// Hook للتعامل مع عمليات رفع وتنزيل المرفقات
export const useAttachments = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadAttachment = async (file: File, correspondenceId: string, isMainDocument: boolean = false) => {
    try {
      setUploading(true);
      
      // 1. Upload the file to Storage
      const filePath = `correspondence/${correspondenceId}/${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);
        
      if (uploadError) {
        throw new Error(uploadError.message);
      }
      
      // 2. Create the attachment record in the database
      const { error: dbError } = await supabase
        .from('correspondence_attachments')
        .insert({
          correspondence_id: correspondenceId,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          is_main_document: isMainDocument,
        });
        
      if (dbError) {
        throw new Error(dbError.message);
      }
      
      return { success: true, filePath };
    } catch (err: any) {
      setUploadError(err.message);
      return { success: false, error: err.message };
    } finally {
      setUploading(false);
    }
  };

  const downloadAttachment = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('attachments')
        .download(filePath);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Create a downloadable link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
      
      return { success: true };
    } catch (err: any) {
      console.error('Error downloading file:', err);
      return { success: false, error: err.message };
    }
  };

  const getAttachmentUrl = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { success: true, url: data.publicUrl };
    } catch (err: any) {
      console.error('Error getting file URL:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    uploadAttachment,
    downloadAttachment,
    getAttachmentUrl,
    uploading,
    uploadError
  };
};

// Hook لإضافة معاملة جديدة
export const useAddCorrespondence = () => {
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const addCorrespondence = async (data: Omit<Correspondence, 'id' | 'number'>, files: File[]) => {
    try {
      setAdding(true);
      
      // 1. إضافة المعاملة
      const { data: newCorrespondence, error: addError } = await supabase
        .from('correspondence')
        .insert({
          subject: data.subject,
          sender: data.sender,
          recipient: data.recipient,
          date: data.date,
          status: data.status,
          type: data.type,
          content: data.content,
          priority: data.priority || 'normal',
          is_confidential: data.is_confidential || false,
        })
        .select()
        .single();
        
      if (addError) {
        throw new Error(addError.message);
      }
      
      // 2. رفع المرفقات إذا وجدت
      if (files.length > 0) {
        const attachmentUploader = useAttachments();
        
        for (let i = 0; i < files.length; i++) {
          const isMainDocument = i === 0; // اعتبار أول ملف هو المستند الرئيسي
          await attachmentUploader.uploadAttachment(files[i], newCorrespondence.id, isMainDocument);
        }
      }
      
      return { success: true, data: newCorrespondence };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setAdding(false);
    }
  };
  
  return {
    addCorrespondence,
    adding,
    error
  };
};

