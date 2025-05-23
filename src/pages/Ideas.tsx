
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { AddIdeaDialog } from "@/components/ideas/AddIdeaDialog";
import { toast } from "sonner";
import { IdeasTable } from "@/components/ideas/IdeasTable";
import { DeleteIdeaDialog } from "@/components/ideas/DeleteIdeaDialog";
import type { Idea } from "@/components/ideas/types";

const Ideas = () => {
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [ideaToDelete, setIdeaToDelete] = useState<Idea | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: ideas, isLoading, refetch } = useQuery({
    queryKey: ['ideas', filterStatus],
    queryFn: async () => {
      let query = supabase
        .from('ideas')
        .select(`
          *,
          profiles (
            email,
            display_name
          )
        `);

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
        creator_email: idea.profiles?.email || 'غير معروف',
        creator_display_name: idea.profiles?.display_name || idea.profiles?.email || 'غير معروف'
      }));
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

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8" dir="rtl">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">إدارة الأفكار</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة فكرة
          </Button>
        </div>

        <AddIdeaDialog 
          open={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen}
        />

        <IdeasTable 
          ideas={ideas || []}
          isLoading={isLoading}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          onDelete={handleDelete}
        />

        <DeleteIdeaDialog 
          isOpen={!!ideaToDelete}
          isDeleting={isDeleting}
          onOpenChange={(open) => !open && setIdeaToDelete(null)}
          onConfirm={confirmDelete}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Ideas;
