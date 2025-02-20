
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { exportCardAsImage } from "@/utils/cardExport";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ProjectConfirmationActionsProps {
  onClose: () => void;
  hasDownloaded?: boolean;
  setHasDownloaded?: (value: boolean) => void;
  projectTitle: string;
}

export const ProjectConfirmationActions = ({ 
  onClose, 
  hasDownloaded = false,
  setHasDownloaded,
  projectTitle 
}: ProjectConfirmationActionsProps) => {
  const navigate = useNavigate();

  const handleDownload = async () => {
    console.log('Attempting to download confirmation card');
    const success = await exportCardAsImage("confirmation-card", `تأكيد-التسجيل-${projectTitle}.png`);
    if (success) {
      console.log('Card downloaded successfully');
      setHasDownloaded?.(true);
      toast.success('تم حفظ بطاقة التأكيد بنجاح');
      setTimeout(() => {
        onClose();
        setTimeout(() => {
          navigate('/');
        }, 500);
      }, 1000);
    } else {
      console.error('Failed to download card');
      toast.error('حدث خطأ أثناء حفظ البطاقة');
    }
  };

  const handleClose = () => {
    if (!hasDownloaded) {
      const shouldClose = window.confirm("هل أنت متأكد من إغلاق نافذة التأكيد؟ لم تقم بحفظ التأكيد بعد.");
      if (!shouldClose) return;
    }
    onClose();
  };

  return (
    <div className="space-y-2 mt-4">
      <Button 
        onClick={handleDownload} 
        className="w-full gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md" 
        variant="secondary" 
        size="lg"
      >
        <Download className="w-5 h-5" />
        حفظ البطاقة
      </Button>

      <Button variant="outline" className="w-full" onClick={handleClose}>
        <X className="w-4 h-4 mr-2" />
        إغلاق
      </Button>
    </div>
  );
};
