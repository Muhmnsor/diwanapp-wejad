
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
    if (!term || term.length < 3) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error("يجب تسجيل الدخول للبحث في الرسائل");
      }
      
      let query;
      
      if (folder === 'sent') {
        // البحث في الرسائل المرسلة
        query = supabase
          .from('internal_messages')
          .select(`
            *,
            sender:sender_id (id, display_name, email),
            recipients:internal_message_recipients (
              recipient_id,
              recipient_type,
              profiles:recipient_id (id, display_name, email)
            )
          `)
          .eq('sender_id', user.data.user.id)
          .eq('is_draft', false)
          .or(`subject.ilike.%${term}%,content.ilike.%${term}%`);
      } else if (folder === 'drafts') {
        // البحث في المسودات
        query = supabase
          .from('internal_messages')
          .select(`
            *,
            sender:sender_id (id, display_name, email),
            recipients:internal_message_recipients (
              recipient_id,
              recipient_type,
              profiles:recipient_id (id, display_name, email)
            )
          `)
          .eq('sender_id', user.data.user.id)
          .eq('is_draft', true)
          .or(`subject.ilike.%${term}%,content.ilike.%${term}%`);
      } else {
        // البحث في البريد الوارد أو المهملات أو المميزة بنجمة
        query = supabase
          .from('internal_messages')
          .select(`
            *,
            sender:sender_id (id, display_name, email),
            recipients:internal_message_recipients!inner (
              recipient_id,
              recipient_type,
              read_status,
              is_deleted,
              profiles:recipient_id (id, display_name, email)
            )
          `)
          .eq('recipients.recipient_id', user.data.user.id)
          .eq('recipients.is_deleted', folder === 'trash')
          .eq('is_draft', false);
        
        if (folder === 'starred') {
          query = query.eq('is_starred', true);
        }
        
        query = query.or(`subject.ilike.%${term}%,content.ilike.%${term}%`)
          .order('created_at', { ascending: false });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // تنسيق البيانات
      const messages: Message[] = (data || []).map((msg: any) => {
        return {
          id: msg.id,
          subject: msg.subject || 'بدون موضوع',
          content: msg.content || '',
          sender: {
            id: msg.sender?.id || '',
            name: msg.sender?.display_name || 'غير معروف',
            avatar: null
          },
          recipients: msg.recipients?.map((r: any) => ({
            id: r.recipient_id,
            name: r.profiles?.display_name || 'غير معروف',
            type: r.recipient_type,
            email: r.profiles?.email || ''
          })) || [],
          date: msg.created_at,
          folder: folder,
          read: folder === 'sent' || folder === 'drafts' ? true : msg.recipients?.[0]?.read_status === 'read',
          isStarred: msg.is_starred,
          labels: [],
          attachments: []
        };
      });
      
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
