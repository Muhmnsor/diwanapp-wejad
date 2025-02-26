
import { useNavigate } from "react-router-dom";
import { ArrowRight, LayoutDashboard } from "lucide-react";
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
              onClick={() => navigate('/ideas')}
            >
              <ArrowRight className="h-4 w-4" />
              قائمة الأفكار
            </Button>
            <Button 
              variant="ghost" 
              className="gap-2"
              disabled
            >
              <LayoutDashboard className="h-4 w-4" />
              لوحة التحكم
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">قريباً</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
