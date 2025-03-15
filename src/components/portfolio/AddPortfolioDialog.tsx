
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { PortfolioForm } from "./PortfolioForm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface AddPortfolioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddPortfolioDialog = ({ 
  open, 
  onOpenChange 
}: AddPortfolioDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (formData: {
    name: string;
    description: string;
  }) => {
    setIsSubmitting(true);
    try {
      console.log('Creating portfolio with data:', formData);

      // Create in our database
      const { error: createError } = await supabase
        .from('portfolios')
        .insert([
          {
            name: formData.name,
            description: formData.description,
            sync_enabled: true
          }
        ]);

      if (createError) {
        console.error('Error creating portfolio:', createError);
        throw createError;
      }

      toast.success('تم إنشاء المحفظة بنجاح');
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      onOpenChange(false);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('حدث خطأ أثناء إنشاء المحفظة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">إضافة محفظة جديدة</h2>
            <p className="text-sm text-gray-500">أدخل تفاصيل المحفظة</p>
          </div>

          <PortfolioForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
