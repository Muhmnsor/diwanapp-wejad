import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

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
  priority?: string;
  is_confidential?: boolean;
  tags?: string[];
  assigned_to?: string;
  related_correspondence_id?: string;
  creation_date?: string;
  created_by?: string;
  notes?: string;
  assignment_notes?: string;
  assignment_date?: string;
  completion_notes?: string;
  completion_date?: string;
  archive_number?: string;
  archive_date?: string;
  archive_notes?: string;
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
  const [incomingMail, setIncomingMail] = useState<Correspondence[]>([]);
  const [outgoingMail, setOutgoingMail] = useState<Correspondence[]>([]);
  const [letters, setLetters] = useState<Correspondence[]>([]);
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
        const formattedData = correspondenceData?.map(item => ({
          id: item.id,
          number: item.number,
          subject: item.subject,
          sender: item.sender,
          recipient: item.recipient,
          date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
          status: item.status,
          type: item.type,
          content: item.content,
          creation_date: item.creation_date,
          priority: item.priority,
          is_confidential: item.is_confidential,
          tags: item.tags,
          assigned_to: item.assigned_to,
          related_correspondence_id: item.related_correspondence_id,
          created_by: item.created_by,
          notes: item.notes,
          assignment_notes: item.assignment_notes,
          assignment_date: item.assignment_date,
          completion_notes: item.completion_notes,
          completion_date: item.completion_date,
          archive_number: item.archive_number,
          archive_date: item.archive_date,
          archive_notes: item.archive_notes,
        })) || [];

        setCorrespondence(formattedData);

        // Filter the correspondence data by type
        setIncomingMail(formattedData.filter(item => item.type === 'incoming') || []);
        setOutgoingMail(formattedData.filter(item => item.type === 'outgoing') || []);
        setLetters(formattedData.filter(item => item.type === 'letter') || []);

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

      if (error) {
        toast({
          variant: "destructive",
          title: "خطأ في تنزيل الملف",
          description: "لم نتمكن من تنزيل الملف. الرجاء المحاولة مرة أخرى."
        });
        throw error;
      }

      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "تم تنزيل الملف بنجاح",
        description: `تم تنزيل ${fileName} بنجاح`
      });

      return true;
    } catch (err) {
      console.error("Error downloading attachment:", err);
      return false;
    }
  };

  const distributeCorrespondence = async (
    correspondenceId: string,
    distributionData: {
      distributed_to: string;
      distributed_by: string;
      distributed_to_department?: string;
      instructions?: string;
      response_deadline?: string;
    }
  ) => {
    try {
      const { data, error } = await supabase
        .from('correspondence_distribution')
        .insert([
          {
            correspondence_id: correspondenceId,
            distributed_to: distributionData.distributed_to,
            distributed_by: distributionData.distributed_by,
            distributed_to_department: distributionData.distributed_to_department,
            instructions: distributionData.instructions,
            response_deadline: distributionData.response_deadline,
            distribution_date: new Date().toISOString(),
            status: 'pending',
            is_read: false
          }
        ])
        .select();

      if (error) throw error;

      // Add to history
      await addToHistory(correspondenceId, 'توزيع المعاملة', distributionData.distributed_by,
        `تم توزيع المعاملة إلى ${distributionData.distributed_to_department || 'جهة معينة'}`);

      return { success: true, data };
    } catch (err) {
      console.error("Error distributing correspondence:", err);
      return { success: false, error: err };
    }
  };

  const addTag = async (correspondenceId: string, tag: string) => {
    try {
      // الحصول على المعاملة
      const { data, error } = await supabase
        .from('correspondence')
        .select('tags')
        .eq('id', correspondenceId)
        .single();

      if (error) throw error;

      // إنشاء مصفوفة وسوم جديدة
      const currentTags = data?.tags || [];
      if (!currentTags.includes(tag)) {
        const updatedTags = [...currentTags, tag];

        // تحديث المعاملة
        const { error: updateError } = await supabase
          .from('correspondence')
          .update({ tags: updatedTags })
          .eq('id', correspondenceId);

        if (updateError) throw updateError;

        // إضافة إلى السجل
        await addToHistory(
          correspondenceId,
          'إضافة وسم',
          undefined,
          `تمت إضافة وسم: ${tag}`
        );

        return { success: true, tags: updatedTags };
      }

      return { success: true, tags: currentTags };
    } catch (err) {
      console.error("Error adding tag:", err);
      return { success: false, error: err };
    }
  };

  const removeTag = async (correspondenceId: string, tag: string) => {
    try {
      // الحصول على المعاملة
      const { data, error } = await supabase
        .from('correspondence')
        .select('tags')
        .eq('id', correspondenceId)
        .single();

      if (error) throw error;

      // إزالة الوسم
      const currentTags = data?.tags || [];
      const updatedTags = currentTags.filter(t => t !== tag);

      // تحديث المعاملة
      const { error: updateError } = await supabase
        .from('correspondence')
        .update({ tags: updatedTags })
        .eq('id', correspondenceId);

      if (updateError) throw updateError;

      // إضافة إلى السجل
      await addToHistory(
        correspondenceId,
        'إزالة وسم',
        undefined,
        `تمت إزالة وسم: ${tag}`
      );

      return { success: true, tags: updatedTags };
    } catch (err) {
      console.error("Error removing tag:", err);
      return { success: false, error: err };
    }
  };

  const respondToDistribution = async (
    distributionId: string,
    responseText: string,
    userId?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('correspondence_distribution')
        .update({
          response_text: responseText,
          response_date: new Date().toISOString(),
          status: 'مكتمل'
        })
        .eq('id', distributionId)
        .select('correspondence_id')
        .single();

      if (error) throw error;

      // Add to history
      if (data?.correspondence_id) {
        await addToHistory(
          data.correspondence_id,
          'الرد على المعاملة',
          userId,
          `تم الرد على المعاملة الموزعة`
        );
      }

      return { success: true, data };
    } catch (err) {
      console.error("Error responding to distribution:", err);
      return { success: false, error: err };
    }
  };

  const addToHistory = async (
    correspondenceId: string,
    actionType: string,
    actionBy?: string,
    details?: string,
    previousStatus?: string,
    newStatus?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('correspondence_history')
        .insert([
          {
            correspondence_id: correspondenceId,
            action_type: actionType,
            action_by: actionBy,
            action_details: details,
            action_date: new Date().toISOString(),
            previous_status: previousStatus,
            new_status: newStatus
          }
        ]);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Error adding to history:", err);
      return false;
    }
  };

  const assignCorrespondence = async (
    correspondenceId: string,
    userId: string,
    notes?: string
  ) => {
    try {
      // تحديث المعاملة
      const { data, error } = await supabase
        .from('correspondence')
        .update({
          assigned_to: userId,
          assignment_notes: notes,
          assignment_date: new Date().toISOString()
        })
        .eq('id', correspondenceId)
        .select('*')
        .single();

      if (error) throw error;

      // إضافة إلى السجل
      await addToHistory(
        correspondenceId,
        'تعيين المعاملة',
        undefined, // مستخدم التعيين
        `تم تعيين المعاملة إلى مستخدم آخر ${userId}`
      );

      return { success: true, data };
    } catch (err) {
      console.error("Error assigning correspondence:", err);
      return { success: false, error: err };
    }
  };

  const completeAssignment = async (
    correspondenceId: string,
    notes?: string
  ) => {
    try {
      // تحديث المعاملة
      const { data, error } = await supabase
        .from('correspondence')
        .update({
          status: 'مكتمل',
          completion_notes: notes,
          completion_date: new Date().toISOString()
        })
        .eq('id', correspondenceId)
        .select('*')
        .single();

      if (error) throw error;

      // إضافة إلى السجل
      await addToHistory(
        correspondenceId,
        'إكمال المعاملة',
        undefined, // مستخدم الإكمال
        `تم إكمال المعاملة المعينة مع ملاحظات: ${notes || 'لا توجد ملاحظات'}`
      );

      return { success: true, data };
    } catch (err) {
      console.error("Error completing assignment:", err);
      return { success: false, error: err };
    }
  };

  // وظيفة للبحث المتقدم
  const advancedSearch = async (criteria: any) => {
    try {
      // بناء استعلام Supabase بناءً على معايير البحث
      let query = supabase
        .from('correspondence')
        .select('*');

      if (criteria.number) {
        query = query.ilike('number', `%${criteria.number}%`);
      }

      if (criteria.subject) {
        query = query.ilike('subject', `%${criteria.subject}%`);
      }

      if (criteria.sender) {
        query = query.ilike('sender', `%${criteria.sender}%`);
      }

      if (criteria.recipient) {
        query = query.ilike('recipient', `%${criteria.recipient}%`);
      }

      if (criteria.type) {
        query = query.eq('type', criteria.type);
      }

      if (criteria.status) {
        query = query.eq('status', criteria.status);
      }

      if (criteria.fromDate) {
        query = query.gte('date', criteria.fromDate);
      }

      if (criteria.toDate) {
        query = query.lte('date', criteria.toDate);
      }

      if (criteria.priority) {
        query = query.eq('priority', criteria.priority);
      }

      if (criteria.is_confidential !== undefined) {
        query = query.eq('is_confidential', criteria.is_confidential);
      }

      if (criteria.archive_number) {
        query = query.ilike('archive_number', `%${criteria.archive_number}%`);
      }

      if (criteria.tags && criteria.tags.length > 0) {
        // البحث عن الوسوم الموجودة في مصفوفة الوسوم
        query = query.contains('tags', criteria.tags);
      }
      const { data, error } = await query.order('date', { ascending: false });

      if (error) throw error;

      // تنسيق البيانات للعرض
      const formattedData = data?.map(item => ({
        id: item.id,
        number: item.number,
        subject: item.subject,
        sender: item.sender,
        recipient: item.recipient,
        date: item.date,
        status: item.status,
        type: item.type,
        content: item.content,
        creation_date: item.creation_date,
        priority: item.priority,
        is_confidential: item.is_confidential,
        tags: item.tags,
        assigned_to: item.assigned_to,
        related_correspondence_id: item.related_correspondence_id,
        created_by: item.created_by,
        notes: item.notes,
        archive_number: item.archive_number,
        archive_date: item.archive_date,
        archive_notes: item.archive_notes,
      })) || [];

      return formattedData;
    } catch (err) {
      console.error("Error performing advanced search:", err);
      return [];
    }
  };

  // وظيفة لحفظ معايير البحث
  const saveSearchCriteria = async (name: string, criteria: any) => {
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .insert([
          {
            name,
            criteria,
            user_id: (await supabase.auth.getUser()).data.user?.id
          }
        ]);

      if (error) throw error;

      return { success: true, data };
    } catch (err) {
      console.error("Error saving search criteria:", err);
      return { success: false, error: err };
    }
  };

  // وظيفة لجلب معايير البحث المحفوظة
  const getSavedSearches = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error("Error fetching saved searches:", err);
      return [];
    }
  };

  // وظيفة للحصول على تقارير المعاملات
  const getCorrespondenceReport = async (reportType: string, fromDate?: string, toDate?: string) => {
    try {
      // يمكن تنفيذ استعلامات مختلفة حسب نوع التقرير
      let query = supabase
        .from('correspondence')
        .select('*');

      if (fromDate) {
        query = query.gte('date', fromDate);
      }

      if (toDate) {
        query = query.lte('date', toDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      // معالجة البيانات وإعداد التقرير
      return { success: true, data };
    } catch (err) {
      console.error("Error generating report:", err);
      return { success: false, error: err };
    }
  };

  return {
    correspondence,
    incomingMail,
    outgoingMail,
    letters,
    attachments,
    loading,
    error,
    hasAttachments,
    getAttachments,
    getHistory,
    downloadAttachment,
    distributeCorrespondence,
    respondToDistribution,
    addToHistory,
    addTag,
    removeTag,
    assignCorrespondence,
    completeAssignment,
    advancedSearch,
    saveSearchCriteria,
    getSavedSearches,
    getCorrespondenceReport
  };
};

export type { Correspondence, CorrespondenceAttachment, History };
