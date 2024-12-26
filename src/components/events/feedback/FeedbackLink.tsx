import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy } from "lucide-react";

interface FeedbackLinkProps {
  eventId: string;
}

export const FeedbackLink = ({ eventId }: FeedbackLinkProps) => {
  const [copied, setCopied] = useState(false);
  const feedbackUrl = `${window.location.origin}/feedback/${eventId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(feedbackUrl);
      setCopied(true);
      toast.success("تم نسخ الرابط");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("حدث خطأ أثناء نسخ الرابط");
    }
  };

  return (
    <div className="flex gap-2 items-center" dir="rtl">
      <Input value={feedbackUrl} readOnly className="flex-1" />
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