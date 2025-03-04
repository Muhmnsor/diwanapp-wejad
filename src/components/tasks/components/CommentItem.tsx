
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { TaskComment } from "../types/taskComment";
import { FileText, Download, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommentItemProps {
  comment: TaskComment;
}

// دالة مساعدة لتقديم الإشارات في النص
const renderTextWithMentions = (text: string) => {
  // مطابقة نمط @username
  const mentionRegex = /@(\S+)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    // إضافة النص قبل الإشارة
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    // إضافة الإشارة مع التنسيق
    parts.push(
      <span key={match.index} className="text-primary font-medium">
        {match[0]}
      </span>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // إضافة أي نص متبقي
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts.length ? parts : text;
};

export const CommentItem = ({ comment }: CommentItemProps) => {
  const formattedDate = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
    locale: ar
  });
  
  // الحصول على اسم المستخدم من البيانات المرتبطة أو استخدام "مستخدم" إذا لم يكن موجودًا
  const userName = comment.profiles?.display_name || comment.profiles?.email || "مستخدم";
  
  // حرف للأفاتار
  const userInitial = userName ? userName.charAt(0).toUpperCase() : "U";

  // تحديد ما إذا كان هناك مرفق
  const hasAttachment = comment.attachment_url && comment.attachment_name;

  // دالة لتنزيل المرفق
  const handleDownload = () => {
    if (comment.attachment_url) {
      const link = document.createElement('a');
      link.href = comment.attachment_url;
      link.target = '_blank';
      link.download = comment.attachment_name || 'attachment';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // تحديد نوع المرفق (صورة أو ملف آخر)
  const isImage = comment.attachment_type?.startsWith('image/');

  return (
    <div className="flex gap-3">
      <Avatar className="h-9 w-9 flex-shrink-0">
        <AvatarFallback className="bg-primary/10 text-primary">
          {userInitial}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="bg-muted/50 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-base">{userName}</span>
            <span className="text-muted-foreground text-xs">{formattedDate}</span>
          </div>
          <p className="text-base whitespace-pre-wrap mb-2">{renderTextWithMentions(comment.content)}</p>
          
          {/* عرض المرفق إذا كان موجودًا */}
          {hasAttachment && (
            <div className="mt-3 border rounded-lg p-2 bg-background">
              {isImage ? (
                <div className="space-y-2">
                  <img 
                    src={comment.attachment_url} 
                    alt={comment.attachment_name || 'مرفق'} 
                    className="max-h-48 max-w-full rounded-md"
                  />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground truncate max-w-[200px]">
                      {comment.attachment_name}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleDownload}
                      className="h-7 px-2"
                    >
                      <Download className="h-3.5 w-3.5 mr-1" />
                      تنزيل
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm truncate max-w-[200px]">
                      {comment.attachment_name}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleDownload}
                    className="h-7 px-2"
                  >
                    <Download className="h-3.5 w-3.5 mr-1" />
                    تنزيل
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
