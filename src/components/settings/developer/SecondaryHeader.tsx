
import { useNavigate } from "react-router-dom";
import { ArrowRight, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SecondaryHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="w-full border-b bg-white">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-center" dir="rtl">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost"
              className="gap-2"
              onClick={() => navigate('/documentation')}
            >
              <FileText className="h-4 w-4" />
              التوثيق
            </Button>
            <Button 
              variant="ghost" 
              className="gap-2"
              onClick={() => navigate('/developer-settings')}
            >
              <Settings className="h-4 w-4" />
              إعدادات المطور
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
