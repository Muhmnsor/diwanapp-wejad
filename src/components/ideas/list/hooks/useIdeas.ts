
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Idea } from "@/types/ideas";
import { toast } from "sonner";

export const useIdeas = () => {
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [ideaToDelete, setIdeaToDelete] = useState<Idea | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: ideas, isLoading, refetch } = useQuery({
    queryKey: ['ideas', filterStatus],
    queryFn: async () => {
      let query = supabase
        .from('ideas')
        .select(`
          *,
          profiles:created_by (
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (filterStatus) {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching ideas:', error);
        throw error;
      }
      
      return data.map(idea => ({
        ...idea,
        creator_email: idea.profiles?.email || 'غير معروف'
      })) as Idea[];
    }
  });

  const handleDelete = async (idea: Idea) => {
    setIdeaToDelete(idea);
  };

  const confirmDelete = async () => {
    if (!ideaToDelete || isDeleting) return;

    setIsDeleting(true);
    console.log('Starting delete operation for idea:', ideaToDelete.id);

    try {
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', ideaToDelete.id);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      console.log('Delete successful');
      toast.success('تم حذف الفكرة بنجاح');
      await refetch();
    } catch (error) {
      console.error('Error deleting idea:', error);
      toast.error('حدث خطأ أثناء حذف الفكرة');
    } finally {
      setIsDeleting(false);
      setIdeaToDelete(null);
    }
  };

  return {
    ideas,
    isLoading,
    filterStatus,
    setFilterStatus,
    ideaToDelete,
    setIdeaToDelete,
    isDeleting,
    handleDelete,
    confirmDelete
  };
};
