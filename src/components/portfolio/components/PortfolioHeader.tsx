import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

export const PortfolioHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">المحافظ</h1>
      <Button 
        onClick={() => navigate("/portfolios/new")}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        <span>إضافة محفظة</span>
      </Button>
    </div>
  );
};