
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/components/mail/InternalMailApp";
import { useDebounce } from "@/hooks/useDebounce";

export const useMailSearch = (folder: string = 'inbox') => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const search = useCallback(async (term: string) => {
    if (!term || term.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error("يجب تسجيل الدخول للبحث في الرسائل");
      }
      
      const userId = user.data.user.id;
      let query;
      
      if (folder === 'sent') {
        // البحث في الرسائل المرسلة
        query = supabase
          .from('internal_messages')
          .select(`
            *,
            sender:profiles!sender_id (id, display_name, email),
            recipients:internal_message_recipients (
              recipient_id,
              recipient_type,
              profiles:profiles!recipient_id (id, display_name, email)
            )
          `)
          .eq('sender_id', userId)
          .eq('is_draft', false)
          .or(`subject.ilike.%${term}%,content.ilike.%${term}%`);
      } else if (folder === 'drafts') {
        // البحث في المسودات
        query = supabase
          .from('internal_messages')
          .select(`
            *,
            sender:profiles!sender_id (id, display_name, email),
            recipients:internal_message_recipients (
              recipient_id,
              recipient_type,
              profiles:profiles!recipient_id (id, display_name, email)
            )
          `)
          .eq('sender_id', userId)
          .eq('is_draft', true)
          .or(`subject.ilike.%${term}%,content.ilike.%${term}%`);
      } else if (folder === 'trash') {
        // البحث في المهملات
        query = supabase
          .from('internal_message_recipients')
          .select(`
            id,
            recipient_id,
            message_id,
            recipient_type,
            read_status,
            is_deleted,
            message:message_id (
              id,
              subject,
              content,
              sender_id,
              created_at,
              is_draft,
              folder,
              is_starred,
              sender:profiles!sender_id (id, display_name, email)
            )
          `)
          .eq('recipient_id', userId)
          .eq('is_deleted', true)
          .or(`message.subject.ilike.%${term}%,message.content.ilike.%${term}%`);
      } else if (folder === 'starred') {
        // البحث في المميزة بنجمة (البريد الوارد)
        const inboxQuery = supabase
          .from('internal_message_recipients')
          .select(`
            id,
            recipient_id,
            message_id,
            recipient_type,
            read_status,
            is_deleted,
            message:message_id (
              id,
              subject,
              content,
              sender_id,
              created_at,
              is_draft,
              folder,
              is_starred,
              sender:profiles!sender_id (id, display_name, email)
            )
          `)
          .eq('recipient_id', userId)
          .eq('is_deleted', false)
          .eq('message.is_starred', true)
          .or(`message.subject.ilike.%${term}%,message.content.ilike.%${term}%`);
          
        // البحث في المميزة بنجمة (البريد الصادر)
        const sentQuery = supabase
          .from('internal_messages')
          .select(`
            *,
            sender:profiles!sender_id (id, display_name, email),
            recipients:internal_message_recipients (
              recipient_id,
              recipient_type,
              profiles:profiles!recipient_id (id, display_name, email)
            )
          `)
          .eq('sender_id', userId)
          .eq('is_draft', false)
          .eq('is_starred', true)
          .or(`subject.ilike.%${term}%,content.ilike.%${term}%`);
          
        const [inboxResult, sentResult] = await Promise.all([
          inboxQuery,
          sentQuery
        ]);
        
        const inboxMessages = (inboxResult.data || []).map(processInboxMessage);
        const sentMessages = (sentResult.data || []).map(processSentMessage);
        
        const combinedResults = [...inboxMessages, ...sentMessages].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setSearchResults(combinedResults);
        setIsSearching(false);
        return;
      } else {
        // البحث في البريد الوارد (الافتراضي)
        query = supabase
          .from('internal_message_recipients')
          .select(`
            id,
            recipient_id,
            message_id,
            recipient_type,
            read_status,
            is_deleted,
            message:message_id (
              id,
              subject,
              content,
              sender_id,
              created_at,
              is_draft,
              folder,
              is_starred,
              sender:profiles!sender_id (id, display_name, email)
            )
          `)
          .eq('recipient_id', userId)
          .eq('is_deleted', false)
          .or(`message.subject.ilike.%${term}%,message.content.ilike.%${term}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // تنسيق البيانات
      let messages: Message[] = [];
      
      if (folder === 'inbox' || folder === 'trash') {
        messages = (data || []).map(processInboxMessage);
      } else if (folder === 'sent' || folder === 'drafts') {
        messages = (data || []).map(processSentMessage);
      }
      
      setSearchResults(messages);
    } catch (error) {
      console.error("Error searching messages:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [folder]);

  useEffect(() => {
    search(debouncedSearchTerm);
  }, [debouncedSearchTerm, search]);

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
  };
};

// دالة لمعالجة رسائل البريد الوارد
const processInboxMessage = (item: any): Message => {
  const message = item.message || {};
  return {
    id: message.id,
    subject: message.subject || 'بدون موضوع',
    content: message.content || '',
    sender: {
      id: message.sender?.id || '',
      name: message.sender?.display_name || 'غير معروف',
      avatar: null
    },
    recipients: [
      {
        id: item.recipient_id,
        name: '', // سيتم تعبئتها في واجهة المستخدم
        type: item.recipient_type || 'to',
        email: ''
      }
    ],
    date: message.created_at,
    folder: 'inbox',
    read: item.read_status === 'read',
    isStarred: message.is_starred || false,
    labels: [],
    attachments: []
  };
};

// دالة لمعالجة رسائل البريد المرسل والمسودات
const processSentMessage = (message: any): Message => {
  return {
    id: message.id,
    subject: message.subject || 'بدون موضوع',
    content: message.content || '',
    sender: {
      id: message.sender?.id || '',
      name: message.sender?.display_name || 'غير معروف',
      avatar: null
    },
    recipients: Array.isArray(message.recipients) ? message.recipients.map((r: any) => ({
      id: r.recipient_id,
      name: r.profiles?.display_name || 'غير معروف',
      type: r.recipient_type || 'to',
      email: r.profiles?.email || ''
    })) : [],
    date: message.created_at,
    folder: message.is_draft ? 'drafts' : 'sent',
    read: true, // الرسائل المرسلة تعتبر مقروءة دائمًا
    isStarred: message.is_starred || false,
    labels: [],
    attachments: []
  };
};
