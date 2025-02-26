
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AddIdeaDialog } from "@/components/ideas/AddIdeaDialog";
import { IdeasTable } from "@/components/ideas/list/IdeasTable";
import { useIdeas } from "@/components/ideas/list/hooks/useIdeas";
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

const Ideas = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const {
    ideas,
    isLoading,
    filterStatus,
    setFilterStatus,
    ideaToDelete,
    setIdeaToDelete,
    isDeleting,
    handleDelete,
    confirmDelete
  } = useIdeas();

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
          ideas={ideas}
          isLoading={isLoading}
          filterStatus={filterStatus}
          onFilterClear={() => setFilterStatus(null)}
          onDeleteIdea={handleDelete}
          isDeleting={isDeleting}
        />
      </main>

      <Footer />

      <AlertDialog 
        open={!!ideaToDelete} 
        onOpenChange={(open) => {
          if (!open && !isDeleting) setIdeaToDelete(null);
        }}
      >
        <AlertDialogContent className="font-kufi" dir="rtl">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-right">هل أنت متأكد من حذف هذه الفكرة؟</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              سيتم حذف الفكرة نهائياً ولا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row-reverse sm:space-x-reverse space-x-reverse gap-2">
            <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'جاري الحذف...' : 'حذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Ideas;
