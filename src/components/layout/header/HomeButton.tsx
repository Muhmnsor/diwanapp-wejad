
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
        variant="outline"
        size="sm"
        className="flex items-center gap-2 text-sm transition-colors duration-200 hover:bg-gray-100"
        onClick={() => navigate("/")}
      >
        <Home className="h-4 w-4 text-primary" />
        <span>العودة للأحداث</span>
      </Button>
    );
  }

  return null;
};
