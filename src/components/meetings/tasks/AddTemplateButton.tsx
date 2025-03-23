
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";
import { TaskAttachmentField } from "@/components/tasks/project-details/components/TaskAttachmentField";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AddTemplateButtonProps {
  templates: File[] | null;
  setTemplates: (files: File[] | null) => void;
}

export const AddTemplateButton: React.FC<AddTemplateButtonProps> = ({ 
  templates, 
  setTemplates 
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button 
        type="button" 
        variant="outline" 
        className="w-full mt-2" 
        onClick={() => setIsDialogOpen(true)}
      >
        <FileUp className="h-4 w-4 ml-2" />
        إضافة نماذج للمهمة
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg">إرفاق نماذج للمهمة</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <TaskAttachmentField
              attachment={templates}
              setAttachment={setTemplates}
              category="template"
              label="إرفاق نماذج للمهمة"
            />

            <div className="flex justify-end mt-4">
              <Button onClick={() => setIsDialogOpen(false)}>
                تم
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {templates && templates.length > 0 && (
        <div className="mt-2 text-sm text-muted-foreground">
          تم إرفاق {templates.length} {templates.length === 1 ? 'نموذج' : 'نماذج'}
        </div>
      )}
    </>
  );
};
