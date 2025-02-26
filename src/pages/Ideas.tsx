
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { Plus, FilterX, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { AddIdeaDialog } from "@/components/ideas/AddIdeaDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Idea {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string | null;
  created_at: string;
  created_by: string;
  discussion_period: string | null;
  proposed_execution_date: string;
}

const Ideas = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [ideaToDelete, setIdeaToDelete] = useState<Idea | null>(null);

  const { data: ideas, isLoading, refetch } = useQuery({
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

  const handleDelete = async (idea: Idea) => {
    setIdeaToDelete(idea);
  };

  const confirmDelete = async () => {
    if (!ideaToDelete) return;

    try {
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', ideaToDelete.id);

      if (error) throw error;

      toast.success('تم حذف الفكرة بنجاح');
      refetch();
    } catch (error) {
      console.error('Error deleting idea:', error);
      toast.error('حدث خطأ أثناء حذف الفكرة');
    } finally {
      setIdeaToDelete(null);
    }
  };

  const calculateRemainingTime = (discussionPeriod: string | null) => {
    if (!discussionPeriod) return "لم يتم تحديد مدة";
    
    try {
      const days = parseInt(discussionPeriod.split(' ')[0]);
      if (isNaN(days)) return "تنسيق غير صحيح";

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);
      
      const now = new Date();
      const diffTime = endDate.getTime() - now.getTime();
      
      if (diffTime <= 0) {
        return "انتهت المناقشة";
      }

      const remainingDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const remainingHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (remainingDays > 0) {
        return `${remainingDays} يوم و ${remainingHours} ساعة`;
      } else if (remainingHours > 0) {
        return `${remainingHours} ساعة`;
      } else {
        return "أقل من ساعة";
      }
    } catch (error) {
      console.error('Error calculating remaining time:', error);
      return "خطأ في الحساب";
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'draft':
        return 'مسودة';
      case 'under_review':
        return 'قيد المراجعة';
      case 'approved':
        return 'تمت الموافقة';
      case 'rejected':
        return 'مرفوضة';
      default:
        return 'مؤرشفة';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-primary/5">
                <TableRow>
                  <TableHead className="text-center font-bold text-lg py-4 text-primary">
                    عنوان الفكرة
                  </TableHead>
                  <TableHead className="text-center font-bold text-lg py-4 text-primary">
                    المنشئ
                  </TableHead>
                  <TableHead className="text-center font-bold text-lg py-4 text-primary">
                    تاريخ الإنشاء
                  </TableHead>
                  <TableHead className="text-center font-bold text-lg py-4 text-primary">
                    الوقت المتبقي للمناقشة
                  </TableHead>
                  <TableHead className="text-center font-bold text-lg py-4 text-primary">
                    الحالة
                  </TableHead>
                  <TableHead className="text-center font-bold text-lg py-4 text-primary">
                    الإجراءات
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : !ideas?.length ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="space-y-4">
                        <p className="text-gray-500">لا توجد أفكار حالياً</p>
                        {filterStatus && (
                          <Button 
                            variant="outline" 
                            onClick={() => setFilterStatus(null)}
                            className="mx-auto"
                          >
                            <FilterX className="ml-2 h-4 w-4" />
                            إزالة الفلتر
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  ideas.map((idea) => (
                    <TableRow 
                      key={idea.id}
                      className="hover:bg-muted/50"
                    >
                      <TableCell className="text-center">
                        <Link 
                          to={`/ideas/${idea.id}`}
                          className="font-medium text-primary hover:underline block w-full h-full"
                        >
                          {idea.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center">{idea.created_by}</TableCell>
                      <TableCell className="text-center">
                        {new Date(idea.created_at).toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell className="text-center">
                        {calculateRemainingTime(idea.discussion_period)}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusClass(idea.status)}`}>
                          {getStatusDisplay(idea.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-600 hover:text-red-800 hover:bg-red-100"
                          onClick={() => handleDelete(idea)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      <Footer />

      <AlertDialog 
        open={!!ideaToDelete} 
        onOpenChange={() => setIdeaToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذه الفكرة؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف الفكرة نهائياً ولا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Ideas;
