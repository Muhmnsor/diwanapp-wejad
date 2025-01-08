import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface HomeButtonProps {
  isEventOrProjectDetails: boolean;
  isAuthenticated: boolean;
}

export const HomeButton = ({ isEventOrProjectDetails, isAuthenticated }: HomeButtonProps) => {
  const navigate = useNavigate();

  if (isEventOrProjectDetails && !isAuthenticated) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => navigate("/")}
      >
        <Home className="h-4 w-4" />
        <span>العودة للأحداث</span>
      </Button>
    );
  }

  return null;
};