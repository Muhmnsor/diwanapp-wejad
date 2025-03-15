
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface DeletePortfolioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolioId: string;
  portfolioName: string;
}

export const DeletePortfolioDialog = ({
  open,
  onOpenChange,
  portfolioId,
  portfolioName
}: DeletePortfolioDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      console.log('Deleting portfolio:', portfolioId);

      // First delete all related portfolio_only_projects
      const { error: projectsError } = await supabase
        .from('portfolio_only_projects')
        .delete()
        .eq('portfolio_id', portfolioId);

      if (projectsError) {
        console.error('Error deleting related projects:', projectsError);
        throw projectsError;
      }

      // Then delete all related portfolio_projects
      const { error: portfolioProjectsError } = await supabase
        .from('portfolio_projects')
        .delete()
        .eq('portfolio_id', portfolioId);

      if (portfolioProjectsError) {
        console.error('Error deleting portfolio projects:', portfolioProjectsError);
        throw portfolioProjectsError;
      }

      // Finally delete the portfolio itself
      const { error: deleteError } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', portfolioId);

      if (deleteError) {
        console.error('Error deleting portfolio:', deleteError);
        throw deleteError;
      }

      toast.success('تم حذف المحفظة بنجاح');
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      onOpenChange(false);
    } catch (error) {
      console.error('Error in handleDelete:', error);
      toast.error('حدث خطأ أثناء حذف المحفظة');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">حذف المحفظة</h2>
            <p className="text-sm text-gray-500">
              هل أنت متأكد من حذف محفظة "{portfolioName}"؟
              سيتم حذف جميع المشاريع والمهام المرتبطة بها.
            </p>
          </div>

          <div className="flex justify-start gap-2">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "جاري الحذف..." : "حذف المحفظة"}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
            >
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
