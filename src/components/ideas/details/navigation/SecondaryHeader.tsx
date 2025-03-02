
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const SecondaryHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-muted py-2 px-4 border-b">
      <div className="container mx-auto flex items-center justify-start">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1 text-muted-foreground"
          onClick={() => navigate("/ideas")}
        >
          <ArrowRight className="h-4 w-4" />
          <span>العودة إلى قائمة الأفكار</span>
        </Button>
      </div>
    </div>
  );
};
