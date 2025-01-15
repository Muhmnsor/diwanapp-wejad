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
  asanaGid?: string | null;
}

export const DeletePortfolioDialog = ({
  open,
  onOpenChange,
  portfolioId,
  portfolioName,
  asanaGid
}: DeletePortfolioDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      console.log('Deleting portfolio:', portfolioId);

      // If portfolio has Asana integration, delete from Asana first
      if (asanaGid) {
        console.log('Deleting from Asana first:', asanaGid);
        const { error: asanaError } = await supabase.functions.invoke('delete-portfolio', {
          body: { portfolioGid: asanaGid }
        });

        if (asanaError) {
          console.error('Error deleting from Asana:', asanaError);
          throw asanaError;
        }
      }

      // Delete from database
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