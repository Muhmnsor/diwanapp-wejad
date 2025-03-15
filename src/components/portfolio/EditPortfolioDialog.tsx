
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PortfolioForm } from "./PortfolioForm";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  portfolio,
}: EditPortfolioDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (values: { name: string; description: string }) => {
    setIsSubmitting(true);
    console.log('Updating portfolio:', values);

    try {
      // Update in the database
      const { error: updateError } = await supabase
        .from('portfolios')
        .update({
          name: values.name,
          description: values.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', portfolio.id);

      if (updateError) {
        console.error('Error updating portfolio:', updateError);
        throw updateError;
      }

      await queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      toast.success('تم تحديث المحفظة بنجاح');
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تعديل المحفظة</DialogTitle>
        </DialogHeader>
        <PortfolioForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => onOpenChange(false)}
          initialData={{
            name: portfolio.name,
            description: portfolio.description || '',
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
