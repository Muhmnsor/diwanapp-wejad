
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Paperclip, X } from "lucide-react";
import { toast } from "sonner";

interface TaskDeliverableFieldProps {
  deliverable: File[] | null;
  setDeliverable: (file: File[] | null) => void;
}

export const TaskDeliverableField = ({ 
  deliverable, 
  setDeliverable
}: TaskDeliverableFieldProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("حجم الملف كبير جدًا. الحد الأقصى 5 ميجابايت");
        return;
      }
      
      // Add new file to existing files array
      const updatedDeliverables = deliverable ? [...deliverable, selectedFile] : [selectedFile];
      setDeliverable(updatedDeliverables);
    }
    
    // Clear input value to allow selecting the same file again
    if (e.target.value) {
      e.target.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    if (deliverable) {
      const updatedDeliverables = [...deliverable];
      updatedDeliverables.splice(index, 1);
      setDeliverable(updatedDeliverables.length > 0 ? updatedDeliverables : null);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="deliverable">المستلمات</Label>
      <div className="flex flex-col gap-2">
        <div className="flex items-center">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => document.getElementById("deliverable")?.click()} 
            className="relative"
          >
            <Paperclip className="h-4 w-4 ml-2" />
            رفع مستلمات
          </Button>
          <input
            type="file"
            id="deliverable"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          />
        </div>
        
        {deliverable && deliverable.length > 0 && (
          <div className="mt-2 space-y-2">
            {deliverable.map((file, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded-md bg-gray-50 break-all">
                <span className="flex-1 truncate text-sm">{file.name}</span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleRemoveFile(index)} 
                  className="h-7 w-7 p-0 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
