
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy } from "lucide-react";

interface FeedbackLinkProps {
  eventId: string;
  isActivity?: boolean;
}

export const FeedbackLink = ({ eventId, isActivity = false }: FeedbackLinkProps) => {
  const [copied, setCopied] = useState(false);
  const path = isActivity ? 'activities' : 'events';
  const feedbackUrl = `${window.location.origin}/${path}/${eventId}/feedback`;

  console.log(`Generating feedback URL for ${isActivity ? 'activity' : 'event'}:`, eventId);
  console.log('Generated feedback URL:', feedbackUrl);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(feedbackUrl);
      setCopied(true);
      toast.success("تم نسخ الرابط");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying feedback URL:', err);
      toast.error("حدث خطأ أثناء نسخ الرابط");
    }
  };

  return (
    <div className="flex gap-2 items-center" dir="rtl">
      <Input 
        value={feedbackUrl} 
        readOnly 
        className="flex-1 bg-white"
        onClick={(e) => (e.target as HTMLInputElement).select()}
      />
      <Button
        variant="outline"
        size="icon"
        onClick={handleCopy}
        className={copied ? "text-green-500" : ""}
      >
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
};
