
import { Share2, X, Facebook, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ShareButtonProps {
  url?: string;
  title?: string;
  text?: string;
  onShare?: () => Promise<void>;
}

export const ShareButton = ({ 
  url = window.location.href,
  title = "",
  text = "",
  onShare 
}: ShareButtonProps) => {
  const handleShare = async (method: 'copy' | 'x' | 'facebook' | 'whatsapp') => {
    switch (method) {
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          toast("تم نسخ رابط الفعالية إلى الحافظة");
        } catch (error) {
          console.error('Error copying link:', error);
          toast.error("لم نتمكن من نسخ الرابط");
        }
        break;
      
      case 'x':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title + "\n" + text)}`, '_blank');
        break;
      
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title + "\n" + text)}`, '_blank');
        break;
      
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(title + "\n" + text + "\n" + url)}`, '_blank');
        break;
    }

    if (onShare) {
      await onShare();
    }
  };

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="w-8 h-8 hover:bg-purple-50">
          <Share2 className="h-4 w-4 text-purple-600" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="min-w-[240px] p-2 backdrop-blur-xl bg-white/95 border border-purple-100 shadow-lg rounded-xl"
      >
        <DropdownMenuItem 
          onClick={() => handleShare('x')} 
          className="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-purple-50 cursor-pointer"
        >
          <X className="h-4 w-4 text-gray-600" />
          <span className="text-gray-700">مشاركة على X</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleShare('facebook')} 
          className="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-purple-50 cursor-pointer"
        >
          <Facebook className="h-4 w-4 text-blue-600" />
          <span className="text-gray-700">مشاركة على فيسبوك</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleShare('whatsapp')} 
          className="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-purple-50 cursor-pointer"
        >
          <MessageCircle className="h-4 w-4 text-green-600" />
          <span className="text-gray-700">مشاركة عبر واتساب</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleShare('copy')} 
          className="flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-purple-50 cursor-pointer"
        >
          <Share2 className="h-4 w-4 text-purple-600" />
          <span className="text-gray-700">نسخ الرابط</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
