
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { Plus, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { AddIdeaDialog } from "@/components/ideas/AddIdeaDialog";

interface Idea {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string | null;
  created_at: string;
}

const Ideas = () => {
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: ideas, isLoading } = useQuery({
    queryKey: ['ideas', filterStatus],
    queryFn: async () => {
      let query = supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterStatus) {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching ideas:', error);
        throw error;
      }
      
      return data as Idea[];
    }
  });

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

        {isLoading ? (
          <div className="text-center py-8">جاري التحميل...</div>
        ) : !ideas?.length ? (
          <div className="text-center py-8 space-y-4">
            <p className="text-gray-500">لا توجد أفكار حالياً</p>
            <Button 
              variant="outline" 
              onClick={() => setFilterStatus(null)}
              className="mx-auto"
            >
              <FilterX className="ml-2 h-4 w-4" />
              إزالة الفلتر
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ideas.map((idea) => (
              <div 
                key={idea.id} 
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:border-primary/20 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg">{idea.title}</h3>
                  <span className="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">
                    {idea.status === 'draft' ? 'مسودة' :
                     idea.status === 'under_review' ? 'قيد المراجعة' :
                     idea.status === 'approved' ? 'تمت الموافقة' :
                     idea.status === 'rejected' ? 'مرفوضة' : 
                     'مؤرشفة'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {idea.description}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{new Date(idea.created_at).toLocaleDateString('ar-SA')}</span>
                  {idea.category && (
                    <span className="bg-secondary/50 px-2 py-1 rounded-full">
                      {idea.category}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <AddIdeaDialog 
          open={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Ideas;
