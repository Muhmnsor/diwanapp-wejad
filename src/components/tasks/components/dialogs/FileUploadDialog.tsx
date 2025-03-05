
import { useState } from "react";
import { Task } from "../../types/task";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAttachmentOperations } from "../../hooks/useAttachmentOperations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileUp, Package } from "lucide-react";

interface FileUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
}

export const FileUploadDialog = ({ isOpen, onClose, task }: FileUploadDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileCategory, setFileCategory] = useState("creator");
  const [activeTab, setActiveTab] = useState("attachment");
  const { uploadAttachment, uploadDeliverable, isUploading } = useAttachmentOperations(
    undefined,
    () => {
      setSelectedFile(null);
      onClose();
    }
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !task.id) return;

    if (activeTab === "attachment") {
      await uploadAttachment(
        selectedFile,
        task.id,
        fileCategory,
        task.is_subtask ? "subtasks" : "tasks"
      );
    } else {
      await uploadDeliverable(
        selectedFile,
        task.id,
        task.is_subtask ? "subtasks" : "tasks"
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>رفع ملف</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="attachment" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="attachment" className="flex items-center gap-2">
              <FileUp className="h-4 w-4" />
              مرفق عادي
            </TabsTrigger>
            <TabsTrigger value="deliverable" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              مستلم المهمة
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attachment">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">نوع المرفق:</label>
                <select
                  value={fileCategory}
                  onChange={(e) => setFileCategory(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="creator">مرفق منشئ المهمة</option>
                  <option value="assignee">مرفق المكلف بالمهمة</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">اختر ملفًا:</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="deliverable">
            <div className="space-y-4">
              <div className="bg-amber-50 p-3 rounded-md text-sm border border-amber-200 mb-2">
                <p className="font-medium text-amber-700">معلومات عن المستلمات:</p>
                <p className="text-amber-600 mt-1">المستلمات هي الملفات النهائية التي يتم تسليمها كإنجاز للمهمة، وتخضع للمراجعة والاعتماد من منشئ المهمة.</p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">اختر ملف المستلم:</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            إلغاء
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                جاري الرفع...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                {activeTab === "attachment" ? "رفع المرفق" : "رفع المستلم"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
