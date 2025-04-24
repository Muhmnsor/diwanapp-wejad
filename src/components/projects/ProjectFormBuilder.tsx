
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormBuilder } from "@/components/form-builder/FormBuilder";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ProjectFormBuilderProps {
  onSaveForm?: (formConfig: any) => void;
  initialForm?: any;
}

export const ProjectFormBuilder = ({ onSaveForm, initialForm }: ProjectFormBuilderProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formConfig, setFormConfig] = useState(initialForm || null);

  const handleSaveForm = (config: any) => {
    setFormConfig(config);
    onSaveForm?.(config);
    setIsDialogOpen(false);
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">حقول إضافية مخصصة</h3>
        <p className="text-sm text-muted-foreground">
          يمكنك إضافة حقول مخصصة للنموذج مثل الاختيار المتعدد، تحميل الملفات، أو التنبيهات.
        </p>
      </div>

      {formConfig ? (
        <Card className="mb-4 border-primary/40">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">{formConfig.title || "نموذج مخصص"}</h4>
              <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
                تعديل النموذج
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {formConfig.description || "يحتوي هذا النموذج على حقول مخصصة."}
            </p>
            <div className="mt-2">
              <p className="text-sm">
                عدد الحقول: {formConfig.fields?.length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button 
          variant="outline" 
          onClick={() => setIsDialogOpen(true)}
          className="w-full h-20 border-dashed"
        >
          <Plus className="h-5 w-5 ml-2" />
          إضافة حقول مخصصة للنموذج
        </Button>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="min-w-[800px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إنشاء نموذج مخصص</DialogTitle>
          </DialogHeader>
          <FormBuilder onSave={handleSaveForm} initialFormData={formConfig} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
