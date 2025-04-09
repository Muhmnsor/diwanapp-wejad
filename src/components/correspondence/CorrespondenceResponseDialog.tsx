import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from "@/components/ui/file-uploader";
import { Send, PaperclipIcon, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCorrespondence } from "@/hooks/useCorrespondence";
import { RichTextEditor } from "./RichTextEditor";

interface ResponseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  distributionId: string;
  correspondenceId: string;
  correspondenceNumber: string;
}

export const CorrespondenceResponseDialog: React.FC<ResponseDialogProps> = ({
  isOpen,
  onClose,
  distributionId,
  correspondenceId,
  correspondenceNumber,
}) => {
  const [responseText, setResponseText] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  const { respondToDistribution } = useCorrespondence();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!responseText.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال نص الرد"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await respondToDistribution(distributionId, {
        responseText,
        files,
        correspondenceId
      });
      
      if (!result.success) {
        throw new Error(result.error || "فشل في إرسال الرد");
      }
      
      toast({
        title: "تم إرسال الرد بنجاح",
        description: `تم إرسال الرد على المعاملة رقم ${correspondenceNumber} بنجاح`
      });
      
      onClose();
    } catch (error) {
      console.error("Error sending response:", error);
      toast({
        variant: "destructive",
        title: "خطأ في إرسال الرد",
        description: String(error) || "حدث خطأ أثناء إرسال الرد، يرجى المحاولة مرة أخرى"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (uploadedFiles: File[]) => {
    setFiles(prev => [...prev, ...uploadedFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            الرد على المعاملة {correspondenceNumber}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-grow overflow-auto">
            <div className="mb-4">
              <Label htmlFor="response-text">نص الرد</Label>
              <RichTextEditor
                value={responseText}
                onChange={setResponseText}
                placeholder="أدخل نص الرد على المعاملة..."
                className="min-h-[250px]"
              />
            </div>
            
            <div className="mb-4">
              <Label>المرفقات</Label>
              <FileUploader 
                onFilesSelected={handleFileUpload}
                maxFiles={5}
                maxSizeMB={10}
                acceptedFileTypes={[
                  "application/pdf",
                  "image/jpeg",
                  "image/png",
                  "application/msword",
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                ]}
              />
              
              {files.length > 0 && (
                <div className="mt-2 space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center">
                        <PaperclipIcon className="h-4 w-4 mr-2" />
                        <span className="text-sm">{file.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(index)}
                      >
                        إزالة
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="mt-6 gap-2 sm:justify-end">
            <Button 
              type="submit" 
              disabled={loading || !responseText.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  إرسال الرد
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
