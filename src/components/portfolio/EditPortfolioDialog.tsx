import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { PortfolioForm } from "./PortfolioForm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface EditPortfolioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolio: {
    id: string;
    name: string;
    description: string | null;
  };
}

export const EditPortfolioDialog = ({
  open,
  onOpenChange,
  portfolio
}: EditPortfolioDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (formData: {
    name: string;
    description: string;
  }) => {
    setIsSubmitting(true);
    try {
      console.log('Updating portfolio with data:', formData);

      const { error: updateError } = await supabase
        .from('portfolios')
        .update({
          name: formData.name,
          description: formData.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', portfolio.id);

      if (updateError) {
        console.error('Error updating portfolio:', updateError);
        throw updateError;
      }

      toast.success('تم تحديث المحفظة بنجاح');
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      onOpenChange(false);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('حدث خطأ أثناء تحديث المحفظة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">تعديل المحفظة</h2>
            <p className="text-sm text-gray-500">قم بتعديل تفاصيل المحفظة</p>
          </div>

          <PortfolioForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            onCancel={() => onOpenChange(false)}
            initialData={portfolio}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};