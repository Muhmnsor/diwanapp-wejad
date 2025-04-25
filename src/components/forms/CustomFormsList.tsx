
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CustomFormBuilder } from './CustomFormBuilder';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

export const CustomFormsList: React.FC = () => {
  const [customForms, setCustomForms] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchCustomForms = async () => {
    const { data, error } = await supabase
      .from('custom_forms')
      .select('*');

    if (error) {
      toast.error('حدث خطأ أثناء جلب النماذج');
      console.error('Error fetching forms:', error);
    } else {
      setCustomForms(data || []);
    }
  };

  React.useEffect(() => {
    fetchCustomForms();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">النماذج المخصصة</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>إنشاء نموذج جديد</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>إنشاء نموذج مخصص</DialogTitle>
            </DialogHeader>
            <CustomFormBuilder 
              onSave={() => {
                fetchCustomForms();
                setIsDialogOpen(false);
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {customForms.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          لا توجد نماذج مخصصة حتى الآن
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customForms.map((form) => (
            <Card key={form.id}>
              <CardHeader>
                <CardTitle>{form.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{form.description || 'لا يوجد وصف'}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-muted-foreground">
                    {form.created_at ? new Date(form.created_at).toLocaleDateString() : 'تاريخ غير محدد'}
                  </span>
                  <Button variant="outline" size="sm">
                    تعديل
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
