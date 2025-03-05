
import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadAttachment, saveAttachmentReference } from '../../services/uploadService';
import { toast } from 'sonner';

interface AssigneeAttachmentButtonProps {
  taskId: string;
  onAttachmentUploaded?: () => void;
  isAssigned?: boolean;
  buttonVariant?: 'default' | 'outline' | 'ghost';
  buttonSize?: 'sm' | 'default';
  buttonText?: string;
  buttonIcon?: boolean;
}

export const AssigneeAttachmentButton = ({
  taskId,
  onAttachmentUploaded,
  isAssigned = true,
  buttonVariant = 'outline',
  buttonSize = 'sm',
  buttonText = 'إضافة مرفق',
  buttonIcon = true
}: AssigneeAttachmentButtonProps) => {
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setIsUploading(true);
    
    try {
      console.log("Starting file upload for assignee attachment");
      
      // رفع الملف مع تحديد التصنيف كمرفق من المكلف
      const uploadResult = await uploadAttachment(file, 'assignee');
      
      if (uploadResult && !uploadResult.error) {
        console.log("File uploaded successfully, now saving reference", uploadResult);
        
        // حفظ معلومات المرفق في قاعدة البيانات
        await saveAttachmentReference(
          taskId,
          uploadResult.url,
          file.name,
          file.type,
          'assignee' // تحديد التصنيف
        );
        
        toast.success('تم رفع المرفق بنجاح');
        
        // استدعاء الدالة لتحديث واجهة المستخدم
        if (onAttachmentUploaded) {
          onAttachmentUploaded();
        }
      } else {
        console.error("Upload failed:", uploadResult?.error);
        toast.error('فشل رفع المرفق');
      }
    } catch (error) {
      console.error('Error uploading assignee attachment:', error);
      toast.error('حدث خطأ أثناء رفع المرفق');
    } finally {
      setIsUploading(false);
      
      // إعادة تعيين حقل الإدخال
      if (e.target) {
        e.target.value = '';
      }
    }
  };
  
  if (!isAssigned) return null;
  
  return (
    <div className="relative">
      <input
        type="file"
        id={`assignee-file-${taskId}`}
        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <Button 
        variant={buttonVariant} 
        size={buttonSize}
        disabled={isUploading}
        className={isUploading ? 'opacity-70 cursor-not-allowed' : ''}
      >
        {buttonIcon && <Upload className="h-4 w-4 ml-2" />}
        {isUploading ? 'جاري الرفع...' : buttonText}
      </Button>
    </div>
  );
};
