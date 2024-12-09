import { Share2, X, Facebook, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

interface ShareButtonProps {
  title?: string;
  text?: string;
  url: string;
}

export const ShareButton = ({ title, text, url }: ShareButtonProps) => {
  const { toast } = useToast();
  
  const handleShare = async (method: 'native' | 'copy' | 'x' | 'facebook' | 'whatsapp') => {
    const shareText = `${title}\n${text}\n`;
    
    switch (method) {
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({
              title,
              text,
              url,
            });
            toast({
              title: "تمت المشاركة بنجاح",
              description: "تم مشاركة الفعالية",
            });
          } catch (error) {
            if ((error as Error).name !== 'AbortError') {
              console.error('Error sharing:', error);
              toast({
                title: "حدث خطأ",
                description: "لم نتمكن من مشاركة الفعالية",
                variant: "destructive",
              });
            }
          }
        }
        break;
      
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          toast({
            title: "تم نسخ الرابط",
            description: "تم نسخ رابط الفعالية إلى الحافظة",
          });
        } catch (error) {
          console.error('Error copying link:', error);
          toast({
            title: "حدث خطأ",
            description: "لم نتمكن من نسخ الرابط",
            variant: "destructive",
          });
        }
        break;
      
      case 'x':
        const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
        window.open(xShareUrl, '_blank');
        break;
      
      case 'facebook':
        const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`;
        window.open(fbShareUrl, '_blank');
        break;
      
      case 'whatsapp':
        const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(shareText + url)}`;
        window.open(whatsappShareUrl, '_blank');
        break;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {navigator.share && (
          <DropdownMenuItem onClick={() => handleShare('native')} className="gap-2">
            <Share2 className="h-4 w-4" />
            مشاركة عبر الجهاز
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => handleShare('x')} className="gap-2">
          <X className="h-4 w-4" />
          مشاركة على X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('facebook')} className="gap-2">
          <Facebook className="h-4 w-4" />
          مشاركة على فيسبوك
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('whatsapp')} className="gap-2">
          <MessageCircle className="h-4 w-4" />
          مشاركة عبر واتساب
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('copy')} className="gap-2">
          <Share2 className="h-4 w-4" />
          نسخ الرابط
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};