import { Share2 } from "lucide-react";
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
  
  const handleShare = async (method: 'native' | 'copy') => {
    if (method === 'native' && navigator.share) {
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
    } else if (method === 'copy') {
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
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {navigator.share && (
          <DropdownMenuItem onClick={() => handleShare('native')}>
            مشاركة الفعالية
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => handleShare('copy')}>
          نسخ الرابط
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};