
import { useState } from "react";
import { FormBuilder } from "@/components/form-builder/FormBuilder";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Event } from "@/store/eventStore";
import { PlusCircle, Edit } from "lucide-react";

interface CustomFormFieldsProps {
  formData: Event;
  setFormData: (data: Event) => void;
}

export const CustomFormFields = ({ formData, setFormData }: CustomFormFieldsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const customForm = formData.customForm || null;
  
  const handleSaveForm = (formConfig: any) => {
    setFormData({
      ...formData,
      customForm: formConfig
    });
    setIsDialogOpen(false);
  };
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">حقول مخصصة</h3>
        <p className="text-sm text-muted-foreground">
          أضف حقول إضافية مخصصة لنموذج التسجيل مثل الاختيارات المتعددة، تحميل الملفات، والرسائل التوضيحية.
        </p>
      </div>
      
      {customForm ? (
        <Card className="border-primary/40 hover:border-primary/60 transition-all">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">{customForm.title || "نموذج مخصص"}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {customForm.description || "حقول مخصصة إضافية للفعالية"}
                </p>
                <p className="text-sm mt-2">
                  عدد الحقول: {customForm.fields?.length || 0}
                </p>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsDialogOpen(true)}
              >
                <Edit className="h-4 w-4 ml-1" />
                تعديل
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button 
          variant="outline" 
          className="w-full h-24 border-dashed flex flex-col items-center justify-center gap-2"
          onClick={() => setIsDialogOpen(true)}
        >
          <PlusCircle className="h-6 w-6" />
          <span>إضافة حقول مخصصة للنموذج</span>
        </Button>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="min-w-[800px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إنشاء نموذج مخصص للتسجيل</DialogTitle>
          </DialogHeader>
          <FormBuilder onSave={handleSaveForm} initialFormData={customForm} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
