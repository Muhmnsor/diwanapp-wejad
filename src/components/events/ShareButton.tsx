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
  
  const handleShare = async (method: 'copy' | 'x' | 'facebook' | 'whatsapp') => {
    const shareText = `${title}\n${text}\n`;
    
    switch (method) {
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
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem onClick={() => handleShare('x')} className="gap-2 flex-row-reverse">
          <X className="h-4 w-4 ml-2" />
          مشاركة على X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('facebook')} className="gap-2 flex-row-reverse">
          <Facebook className="h-4 w-4 ml-2" />
          مشاركة على فيسبوك
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('whatsapp')} className="gap-2 flex-row-reverse">
          <MessageCircle className="h-4 w-4 ml-2" />
          مشاركة عبر واتساب
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('copy')} className="gap-2 flex-row-reverse">
          <Share2 className="h-4 w-4 ml-2" />
          نسخ الرابط
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};