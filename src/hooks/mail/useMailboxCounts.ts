
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useMailboxCounts = () => {
  return useQuery({
    queryKey: ['mail-folder-counts'],
    queryFn: async () => {
      try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) {
          throw new Error("يجب تسجيل الدخول لعرض البريد");
        }
        
        const userId = user.data.user.id;
        
        // عدد الرسائل في البريد الوارد
        const { count: inboxCount, error: inboxError } = await supabase
          .from('internal_message_recipients')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', userId)
          .eq('is_deleted', false);
          
        if (inboxError) throw inboxError;
        
        // عدد الرسائل غير المقروءة
        const { count: unreadCount, error: unreadError } = await supabase
          .from('internal_message_recipients')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', userId)
          .eq('is_deleted', false)
          .eq('read_status', 'unread');
          
        if (unreadError) throw unreadError;
        
        // عدد الرسائل المرسلة
        const { count: sentCount, error: sentError } = await supabase
          .from('internal_messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', userId)
          .eq('is_draft', false);
          
        if (sentError) throw sentError;
        
        // عدد المسودات
        const { count: draftsCount, error: draftsError } = await supabase
          .from('internal_messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', userId)
          .eq('is_draft', true);
          
        if (draftsError) throw draftsError;
        
        // عدد الرسائل في المهملات
        const { count: trashCount, error: trashError } = await supabase
          .from('internal_message_recipients')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', userId)
          .eq('is_deleted', true);
          
        if (trashError) throw trashError;
        
        // عدد الرسائل المميزة بنجمة (من البريد الوارد والصادر)
        // الرسائل المرسلة المميزة بنجمة
        const { count: starredSentCount, error: starredSentError } = await supabase
          .from('internal_messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', userId)
          .eq('is_starred', true);
          
        if (starredSentError) throw starredSentError;
          
        // الرسائل المستلمة المميزة بنجمة
        const { count: starredReceivedCount, error: starredReceivedError } = await supabase
          .from('internal_message_recipients')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', userId)
          .eq('is_deleted', false)
          .eq('internal_messages.is_starred', true);
          
        if (starredReceivedError) throw starredReceivedError;
        
        // إجمالي الرسائل المميزة بنجمة
        const starredCount = (starredSentCount || 0) + (starredReceivedCount || 0);
        
        console.log("Mail counts retrieved:", {
          inbox: inboxCount || 0,
          unread: unreadCount || 0,
          sent: sentCount || 0,
          drafts: draftsCount || 0,
          trash: trashCount || 0,
          starred: starredCount || 0
        });
        
        return {
          inbox: inboxCount || 0,
          unread: unreadCount || 0,
          sent: sentCount || 0,
          drafts: draftsCount || 0,
          trash: trashCount || 0,
          starred: starredCount || 0
        };
      } catch (err) {
        console.error("Error fetching mailbox counts:", err);
        return { 
          inbox: 0, 
          unread: 0, 
          sent: 0, 
          drafts: 0, 
          trash: 0, 
          starred: 0 
        };
      }
    },
    staleTime: 30000, // تحديث البيانات كل 30 ثانية
  });
};
