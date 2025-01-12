import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ReportDeleteDialog } from "@/components/reports/shared/components/ReportDeleteDialog";
import { Portfolio } from "@/types/portfolio";

interface PortfolioDialogsProps {
  showCreateDialog: boolean;
  showEditDialog: boolean;
  showDeleteDialog: boolean;
  selectedPortfolio: Portfolio | null;
  onCloseCreate: () => void;
  onCloseEdit: () => void;
  onCloseDelete: () => void;
  onSuccess: () => void;
}

export const PortfolioDialogs = ({
  showCreateDialog,
  showEditDialog,
  showDeleteDialog,
  selectedPortfolio,
  onCloseCreate,
  onCloseEdit,
  onCloseDelete,
  onSuccess,
}: PortfolioDialogsProps) => {
  const [portfolioForm, setPortfolioForm] = useState({
    name: '',
    description: ''
  });

  const handleCreatePortfolio = async () => {
    try {
      if (!portfolioForm.name.trim()) {
        toast.error('الرجاء إدخال اسم المحفظة');
        return;
      }

      // First create portfolio in Asana
      const asanaResponse = await supabase.functions.invoke('create-asana-portfolio', {
        body: { 
          name: portfolioForm.name,
          notes: portfolioForm.description
        }
      });

      if (asanaResponse.error) {
        throw new Error('Failed to create portfolio in Asana');
      }

      const asanaGid = asanaResponse.data.gid;
      console.log('Created Asana portfolio with GID:', asanaGid);

      // Then create in our database with the Asana GID
      const { error } = await supabase
        .from('portfolios')
        .insert([
          { 
            name: portfolioForm.name,
            description: portfolioForm.description,
            asana_gid: asanaGid
          }
        ]);

      if (error) {
        console.error('Error creating portfolio:', error);
        toast.error('حدث خطأ أثناء إنشاء المحفظة');
        return;
      }

      toast.success('تم إنشاء المحفظة بنجاح');
      onCloseCreate();
      setPortfolioForm({ name: '', description: '' });
      onSuccess();
      
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error('حدث خطأ أثناء إنشاء المحفظة');
    }
  };

  const handleEditPortfolio = async () => {
    try {
      if (!selectedPortfolio || !portfolioForm.name.trim()) {
        toast.error('الرجاء إدخال اسم المحفظة');
        return;
      }

      const { error } = await supabase
        .from('portfolios')
        .update({ 
          name: portfolioForm.name,
          description: portfolioForm.description
        })
        .eq('id', selectedPortfolio.id);

      if (error) {
        console.error('Error updating portfolio:', error);
        toast.error('حدث خطأ أثناء تحديث المحفظة');
        return;
      }

      toast.success('تم تحديث المحفظة بنجاح');
      onCloseEdit();
      setPortfolioForm({ name: '', description: '' });
      onSuccess();

    } catch (error) {
      console.error('Error updating portfolio:', error);
      toast.error('حدث خطأ أثناء تحديث المحفظة');
    }
  };

  const handleDeletePortfolio = async () => {
    try {
      if (!selectedPortfolio) return;

      // First delete from Asana if we have an Asana GID
      if (selectedPortfolio.asana_gid) {
        const { error: asanaError } = await supabase.functions.invoke('delete-asana-portfolio', {
          body: { asana_gid: selectedPortfolio.asana_gid }
        });

        if (asanaError) {
          console.error('Error deleting from Asana:', asanaError);
          toast.error('حدث خطأ أثناء حذف المحفظة من Asana');
          return;
        }
      }

      // Then delete from our database
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', selectedPortfolio.id);

      if (error) {
        console.error('Error deleting portfolio:', error);
        toast.error('حدث خطأ أثناء حذف المحفظة');
        return;
      }

      toast.success('تم حذف المحفظة بنجاح');
      onCloseDelete();
      onSuccess();

    } catch (error) {
      console.error('Error deleting portfolio:', error);
      toast.error('حدث خطأ أثناء حذف المحفظة');
    }
  };

  return (
    <>
      {/* Create Portfolio Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={onCloseCreate}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-right">إنشاء محفظة جديدة</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Input
                id="name"
                placeholder="اسم المحفظة"
                value={portfolioForm.name}
                onChange={(e) => setPortfolioForm(prev => ({ ...prev, name: e.target.value }))}
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Textarea
                id="description"
                placeholder="وصف المحفظة"
                value={portfolioForm.description}
                onChange={(e) => setPortfolioForm(prev => ({ ...prev, description: e.target.value }))}
                className="text-right"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreatePortfolio}>إنشاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Portfolio Dialog */}
      <Dialog 
        open={showEditDialog} 
        onOpenChange={() => {
          onCloseEdit();
          setPortfolioForm({ name: '', description: '' });
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-right">تعديل المحفظة</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Input
                id="name"
                placeholder="اسم المحفظة"
                value={portfolioForm.name}
                onChange={(e) => setPortfolioForm(prev => ({ ...prev, name: e.target.value }))}
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Textarea
                id="description"
                placeholder="وصف المحفظة"
                value={portfolioForm.description}
                onChange={(e) => setPortfolioForm(prev => ({ ...prev, description: e.target.value }))}
                className="text-right"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditPortfolio}>حفظ التغييرات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Portfolio Dialog */}
      <ReportDeleteDialog
        open={showDeleteDialog}
        onOpenChange={onCloseDelete}
        onConfirm={handleDeletePortfolio}
      />
    </>
  );
};